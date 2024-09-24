import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brands } from '../entities/Brands';
import { Users } from '../entities/Users';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brands)
    private readonly brandsRepository: Repository<Brands>,
  ) {}

  findAll(): Promise<Brands[]> {
    return this.brandsRepository.find();
  }

  findOne(id: number): Promise<Brands> {
    return this.brandsRepository.findOne({ where: { brandId: id } });
  }

  create(createBrandDto: CreateBrandDto, user: Users): Promise<Brands> {
    const newBrand = this.brandsRepository.create({
      ...createBrandDto,
      createdBy: user.userId,
      updatedBy: user.userId,
    });
    return this.brandsRepository.save(newBrand);
  }

  async update(
    id: number,
    updateBrandDto: UpdateBrandDto,
    user: Users,
  ): Promise<Brands> {
    await this.brandsRepository.update(id, {
      ...updateBrandDto,
      updatedBy: user.userId,
    });
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.brandsRepository.delete(id);
  }
}
