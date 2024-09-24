import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discounts } from '../entities/Discounts';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Users } from '../entities/Users';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discounts)
    private readonly discountsRepository: Repository<Discounts>,
  ) {}

  async findAll(): Promise<Discounts[]> {
    return await this.discountsRepository.find();
  }

  async findOne(discountId: number): Promise<Discounts> {
    try {
      const discount = await this.discountsRepository.findOne({
        where: { discountId },
      });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      }
      return discount;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async create(
    createDiscountDto: CreateDiscountDto,
    user: Users,
  ): Promise<Discounts> {
    try {
      const discount = this.discountsRepository.create(createDiscountDto);
      return await this.discountsRepository.save({
        ...discount,
        createdBy: user.userId,
      });
    } catch (error) {
      throw new BadRequestException('Failed to create discount');
    }
  }

  async update(
    discountId: number,
    updateDiscountDto: UpdateDiscountDto,
    user: Users,
  ): Promise<Discounts> {
    try {
      const discount = await this.findOne(discountId);
      Object.assign(discount, updateDiscountDto);
      return await this.discountsRepository.save({
        ...discount,
        updatedBy: user.userId,
      });
    } catch (error) {
      throw new BadRequestException('Failed to update discount');
    }
  }

  async remove(discountId: number): Promise<void> {
    try {
      const discount = await this.findOne(discountId);
      await this.discountsRepository.remove(discount);
    } catch (error) {
      throw new BadRequestException('Failed to delete discount');
    }
  }
}
