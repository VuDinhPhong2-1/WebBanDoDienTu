import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderDetailsService } from '../order-details/order-details.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Orders } from '../entities/Orders';
import { Users } from '../entities/Users';
import { OrderStatus } from '../enums/OrderStatus.enum';
import { Products } from '../entities/Products';
import { SalePrices } from '../entities/SalePrices';
import { Discounts } from '../entities/Discounts';
import { calculatePrices } from '../utils/price-calculation';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders)
    private ordersRepository: Repository<Orders>,
    private orderDetailsService: OrderDetailsService,

    @InjectRepository(Products)
    private productsRepository: Repository<Products>,

    @InjectRepository(SalePrices)
    private salePricesRepository: Repository<SalePrices>,

    @InjectRepository(Discounts)
    private discountsRepository: Repository<Discounts>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: Users): Promise<Orders> {
    try {
      const now = new Date();

      // Lấy danh sách productIds từ orderDetails
      const productIds = createOrderDto.orderDetails.map(
        (item) => item.productId,
      );

      // Lấy thông tin sản phẩm
      const products = await this.productsRepository.find({
        where: { productId: In(productIds) },
      });
      const productMap = new Map<number, Products>();
      products.forEach((product) => {
        productMap.set(product.productId, product);
      });

      // Kiểm tra xem có sản phẩm nào không tồn tại không
      if (products.length !== productIds.length) {
        throw new BadRequestException('Một hoặc nhiều sản phẩm không hợp lệ');
      }

      // Lấy thông tin giá bán
      const salePrices = await this.salePricesRepository.find({
        where: { productId: In(productIds) },
      });

      // Tạo một map cho sale prices theo productId
      const salePriceMap = new Map<number, SalePrices[]>();
      salePrices.forEach((sp) => {
        if (!salePriceMap.has(sp.productId)) {
          salePriceMap.set(sp.productId, []);
        }
        salePriceMap.get(sp.productId)?.push(sp);
      });

      // Lấy thông tin chiết khấu
      const discountIds = products
        .map((p) => p.discountId)
        .filter((id) => id !== null) as number[];

      const discounts = await this.discountsRepository.find({
        where: { discountId: In(discountIds) },
      });

      const discountMap = new Map<number, Discounts>();
      discounts.forEach((discount) => {
        discountMap.set(discount.discountId, discount);
      });

      // Tính toán giá cho từng sản phẩm và tạo orderDetails
      let totalAmount = 0;

      const orderDetailsData = [];

      for (const item of createOrderDto.orderDetails) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new BadRequestException(
            `Sản phẩm với ID ${item.productId} không tồn tại`,
          );
        }

        const prices = await calculatePrices(
          product,
          salePriceMap.get(product.productId) || [],
          discountMap,
          now,
        );

        const quantity = item.quantity;
        const unitPrice = prices.discountedPrice;
        const totalPrice = unitPrice * quantity;

        totalAmount += totalPrice;

        orderDetailsData.push({
          productId: item.productId,
          orderId: null, // Sẽ gán sau khi tạo order
          quantity,
          unitPrice,
          discountPercent:
            product.discountId && discountMap.get(product.discountId)
              ? discountMap.get(product.discountId).discountPercent
              : 0,
          totalPrice,
          createdBy: user.username,
        });
      }

      // Tạo đơn hàng
      const order = this.ordersRepository.create({
        userId: user.userId,
        createdBy: user.userId,
        status: OrderStatus.PENDING,
        totalAmount,
        orderDate: new Date(),
        // Các trường khác như shippingAddress, billingAddress, v.v.
        ...createOrderDto,
      });

      const savedOrder = await this.ordersRepository.save(order);

      // Gán orderId cho orderDetails và lưu vào cơ sở dữ liệu
      for (const detail of orderDetailsData) {
        detail.orderId = savedOrder.orderId;
        await this.orderDetailsService.create(detail, user.username);
      }

      return savedOrder;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error creating order and order details',
      );
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
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
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
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}
