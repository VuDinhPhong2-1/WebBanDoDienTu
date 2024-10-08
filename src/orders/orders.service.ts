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
    private connection: Connection,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: Users): Promise<Orders> {
    return await this.connection.transaction(async (manager) => {
      try {
        const now = new Date();

        // Lấy danh sách productIds từ orderDetails
        const productIds = createOrderDto.orderDetails.map(
          (item) => item.productId,
        );

        // Lấy thông tin sản phẩm
        const products = await manager.find(Products, {
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
        const salePrices = await manager.find(SalePrices, {
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

        const discounts = await manager.find(Discounts, {
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

          // Kiểm tra số lượng tồn kho
          if (product.quantity < item.quantity) {
            throw new BadRequestException(
              `Sản phẩm với ID ${item.productId} không đủ số lượng. Tồn kho: ${product.quantity}, Yêu cầu: ${item.quantity}`,
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
            orderId: null,
            quantity,
            unitPrice,
            discountPercent:
              product.discountId && discountMap.get(product.discountId)
                ? discountMap.get(product.discountId).discountPercent
                : 0,
            totalPrice,
            createdBy: user.username,
          });

          // Cập nhật số lượng sản phẩm
          product.quantity -= quantity;
          await manager.save(product);
        }

        // Tạo đơn hàng
        const order = this.ordersRepository.create({
          userId: user.userId,
          createdBy: user.userId,
          status: OrderStatus.PENDING,
          totalAmount,
          orderDate: new Date(),
          // Nếu `createOrderDto` chứa các trường khác không liên quan đến `Orders`,
          // hãy đảm bảo chỉ gán những trường cần thiết
          // ...createOrderDto, // Cẩn thận với spread operator
        });

        const savedOrder = await manager.save(order);

        // Gán orderId cho orderDetails và lưu vào cơ sở dữ liệu
        for (const detail of orderDetailsData) {
          detail.orderId = savedOrder.orderId;
          await this.orderDetailsService.create(detail, user.username, manager);
          // Đảm bảo rằng phương thức create trong OrderDetailsService cũng nhận được manager để sử dụng trong transaction
        }

        return savedOrder;
      } catch (error) {
        // Nếu có lỗi, transaction sẽ tự động rollback
        throw new InternalServerErrorException(
          'Lỗi khi tạo đơn hàng và chi tiết đơn hàng',
        );
      }
    });
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
}
