import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDetailsDto } from './dto/create-order-details.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';
import { OrderDetails } from '../entities/OrderDetails';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetails)
    private orderDetailsRepository: Repository<OrderDetails>,
  ) {}

  async create(
    createOrderDetailsDto: CreateOrderDetailsDto,
    createdBy: string,
  ): Promise<OrderDetails> {
    const orderDetail = this.orderDetailsRepository.create({
      ...createOrderDetailsDto,
      createdBy,
      updatedBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await this.orderDetailsRepository.save(orderDetail);
  }

  async findAll(): Promise<OrderDetails[]> {
    return await this.orderDetailsRepository.find();
  }

  async findOne(id: number): Promise<OrderDetails> {
    const orderDetail = await this.orderDetailsRepository.findOne({
      where: { orderDetailId: id },
    });
    if (!orderDetail) {
      throw new NotFoundException(`OrderDetail with ID ${id} not found`);
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
      throw new NotFoundException(`OrderDetail with ID ${id} not found`);
    }
  }
}
