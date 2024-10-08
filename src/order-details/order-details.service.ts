import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrderDetailsDto } from './dto/create-order-details.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';
import { OrderDetails } from '../entities/OrderDetails';
import { Products } from '../entities/Products';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,

    @InjectRepository(Products)
    private productRepository: Repository<Products>,
  ) {}

  async create(
    createOrderDetailsDto: CreateOrderDetailsDto,
    createdBy: string,
    manager?: EntityManager,
  ): Promise<OrderDetails> {
    const orderDetail = this.orderDetailsRepository.create({
      ...createOrderDetailsDto,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (manager) {
      return await manager.save(orderDetail);
    } else {
      return await this.orderDetailsRepository.save(orderDetail);
    }
  }

  async findAll(): Promise<OrderDetails[]> {
    return await this.orderDetailsRepository.find();
  }

  async findOne(id: number): Promise<OrderDetails> {
    const orderDetail = await this.orderDetailsRepository.findOne({
      where: { orderDetailId: id },
    });
    if (!orderDetail) {
      throw new NotFoundException(
        `Chi tiết đơn hàng với ID ${id} không tồn tại`,
      );
    }
    return orderDetail;
  }

  async update(
    id: number,
    updateOrderDetailsDto: UpdateOrderDetailsDto,
    updatedBy: string,
  ): Promise<OrderDetails> {
    const orderDetail = await this.findOne(id);
    this.orderDetailsRepository.merge(orderDetail, {
      ...updateOrderDetailsDto,
      updatedBy,
      updatedAt: new Date(),
    });
    return await this.orderDetailsRepository.save(orderDetail);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderDetailsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Chi tiết đơn hàng với ID ${id} không tồn tại`,
      );
    }
  }

  async getProductsByOrderId(orderId: number) {
    const query = this.orderDetailsRepository
      .createQueryBuilder('od')
      .innerJoin(Products, 'p', 'p.productId = od.productId')
      .where('od.orderId = :orderId', { orderId })
      .select([
        'p.name AS name',
        'od.quantity AS quantity',
        'od.unitPrice AS unitPrice',
        'od.discountPercent AS discountPercent',
        'od.totalPrice AS totalPrice',
      ]);

    const result = await query.getRawMany();

    if (result.length === 0) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
    }

    return result;
  }
}
