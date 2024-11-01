import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Connection } from 'typeorm';
import { OrderDetailsService } from '../order-details/order-details.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Orders } from '../entities/Orders';
import { Users } from '../entities/Users';
import { Products } from '../entities/Products';
import { SalePrices } from '../entities/SalePrices';
import { Discounts } from '../entities/Discounts';
import { calculatePrices } from '../utils/price-calculation';
import { ProductsService } from '../products/products.service';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { PaymentStatus } from '../enums/paymentStatus.enum';
import { OrderStatus } from '../enums/orderStatus.enum';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private orderDetailsService: OrderDetailsService,
    private readonly mailService: MailerService,
    private readonly productsService: ProductsService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: Users) {
    const queryRunner =
      this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const products = await this.productsService.findByIds(
        createOrderDto.products.map((p) => p.productId),
      );

      let totalAmount = 0;
      let totalDiscountedAmount = 0;
      let totalOriginalAmount = 0;

      const orderDetailsList = [];

      for (const productOrder of createOrderDto.products) {
        const product = products.find(
          (p) => p.productId === productOrder.productId,
        );

        if (!product) {
          throw new BadRequestException(
            `Sản phẩm ${productOrder.productId} không tồn tại`,
          );
        }

        const productPrice = product.discountedPrice
          ? product.discountedPrice
          : product.originalPrice;

        const productOriginalPrice = product.originalPrice;

        totalAmount += productPrice * productOrder.quantity;
        totalOriginalAmount += productOriginalPrice * productOrder.quantity;

        if (product.discountedPrice) {
          totalDiscountedAmount += productPrice * productOrder.quantity;
        }

        const orderDetail = {
          productId: product.productId,
          quantity: productOrder.quantity,
          unitPrice: productPrice,
          discountPercent: product.discountedPrice
            ? ((productOriginalPrice - product.discountedPrice) /
                productOriginalPrice) *
              100
            : 0,
          totalPrice: productPrice * productOrder.quantity,
        };
        orderDetailsList.push(orderDetail);

        await this.productsService.reduceProductQuantity(
          productOrder.productId,
          productOrder.quantity,
          queryRunner,
        );
      }

      const totalDiscountPercentage = totalOriginalAmount
        ? ((totalOriginalAmount - totalDiscountedAmount) /
            totalOriginalAmount) *
          100
        : 0;

      const paymentMethod = await this.paymentMethodsService.findOneByName(
        createOrderDto.paymentMethodName,
      );

      const newOrder = queryRunner.manager.create(Orders, {
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        totalAmount: totalAmount,
        createdBy: user.userId,
        userId: user.userId,
        orderDate: new Date(),
        paymentMethodId: paymentMethod.paymentMethodId,
        discountPercent: totalDiscountPercentage,
        shippingAddress: createOrderDto.shippingAddress,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.Pending,
      });

      // Lưu order vào cơ sở dữ liệu bằng queryRunner
      const savedOrder = await queryRunner.manager.save(newOrder);

      // Lưu từng order detail vào cơ sở dữ liệu
      for (let orderDetail of orderDetailsList) {
        orderDetail.orderId = savedOrder.orderId;
        await this.orderDetailsService.create(orderDetail, queryRunner.manager);
      }

      // Commit transaction nếu không có lỗi
      await queryRunner.commitTransaction();
      console.log('user.email: ', user.email);
      // Gọi MailService để gửi email xác nhận
      await this.mailService.sendOrderConfirmationEmail(user.email, {
        orderId: savedOrder.orderId,
        customerName: createOrderDto.customerName,
        totalAmount: totalAmount,
        orderDate: savedOrder.orderDate,
      });

      return savedOrder;
    } catch (error) {
      // Rollback nếu có lỗi
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException(
        'Lỗi khi tạo đơn hàng và chi tiết đơn hàng',
      );
    } finally {
      // Kết thúc transaction
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Orders[]> {
    return await this.ordersRepository.find();
  }

  async findOne(id: number): Promise<Orders> {
    const order = await this.ordersRepository.findOne({
      where: { orderId: id },
    });
    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại`);
    }
    return order;
  }
  async findAllByUser(userId: number): Promise<Orders[]> {
    const orders = await this.ordersRepository.find({
      where: { userId: userId },
    });
    if (!orders) new NotFoundException('Bạn chưa có đơn hàng nào!');
    return orders;
  }
  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
    user: Users,
  ): Promise<Orders> {
    const order = await this.findOne(id);
    this.ordersRepository.merge(order, {
      ...updateOrderDto,
      updatedBy: user.userId,
      updatedAt: new Date(),
    });
    return await this.ordersRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const result = await this.ordersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Đơn hàng với ID ${id} không tồn tại`);
    }
  }

  async findOneWithDetails(orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { orderId },
    });

    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${orderId} không tồn tại`);
    }
    const paymentMethod = await this.paymentMethodsService.findOneById(
      order.paymentMethodId,
    );
    const orderDetails =
      await this.orderDetailsService.getProductsByOrderId(orderId);

    return {
      order,
      orderDetails,
      paymentMethodDescription: paymentMethod.description,
    };
  }
  async updatePaymentOrderStatus(
    orderId: number,
    status: string,
  ): Promise<void> {
    const order = await this.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Đơn hàng với ID ${orderId} không tồn tại`);
    }

    order.paymentStatus = status;
    await this.ordersRepository.save(order);
  }
}
