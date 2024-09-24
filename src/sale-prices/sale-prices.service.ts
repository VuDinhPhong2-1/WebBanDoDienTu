import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { SalePrices } from '../entities/SalePrices';
import { CreateSalePriceDto } from './dto/create-sale-price.dto';
import { UpdateSalePriceDto } from './dto/update-sale-price.dto';

@Injectable()
export class SalePricesService {
  constructor(
    @InjectRepository(SalePrices)
    private readonly salePricesRepository: Repository<SalePrices>,
  ) {}

  async findAll(): Promise<SalePrices[]> {
    return await this.salePricesRepository.find();
  }

  async findOne(salePriceId: number): Promise<SalePrices> {
    try {
      const salePrice = await this.salePricesRepository.findOne({
        where: { salePriceId },
      });
      if (!salePrice) {
        throw new NotFoundException('SalePrice not found');
      }
      return salePrice;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async create(
    createSalePriceDto: CreateSalePriceDto,
    queryRunner?: QueryRunner,
  ): Promise<SalePrices> {
    try {
      const salePrice = this.salePricesRepository.create(createSalePriceDto);
      if (queryRunner) {
        return await queryRunner.manager.save(salePrice);
      }
      return await this.salePricesRepository.save(salePrice);
    } catch (error) {
      throw new BadRequestException('Không thể tạo giá bán');
    }
  }

  async update(
    salePriceId: number,
    updateSalePriceDto: UpdateSalePriceDto,
  ): Promise<SalePrices> {
    try {
      const salePrice = await this.findOne(salePriceId);
      Object.assign(salePrice, updateSalePriceDto);
      return await this.salePricesRepository.save(salePrice);
    } catch (error) {
      throw new BadRequestException('Failed to update SalePrice');
    }
  }

  async remove(salePriceId: number): Promise<void> {
    try {
      const salePrice = await this.findOne(salePriceId);
      await this.salePricesRepository.remove(salePrice);
    } catch (error) {
      throw new BadRequestException('Failed to delete SalePrice');
    }
  }
}
