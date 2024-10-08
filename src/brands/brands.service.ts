import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  // Lấy tất cả các thương hiệu
  async findAll(): Promise<Brands[]> {
    try {
      return await this.brandsRepository.find();
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách thương hiệu.');
    }
  }

  // Lấy một thương hiệu theo ID
  async findOne(id: number): Promise<Brands> {
    const brand = await this.brandsRepository.findOne({
      where: { brandId: id },
    });
    if (!brand) {
      throw new NotFoundException(`Không tìm thấy thương hiệu với ID ${id}.`);
    }
    return brand;
  }

  // Tạo mới một thương hiệu
  async create(createBrandDto: CreateBrandDto, user: Users): Promise<Brands> {
    try {
      const newBrand = this.brandsRepository.create({
        ...createBrandDto,
        createdBy: user.userId,
        updatedBy: user.userId,
      });
      return await this.brandsRepository.save(newBrand);
    } catch (error) {
      throw new BadRequestException('Không thể tạo thương hiệu.');
    }
  }

  // Cập nhật thông tin một thương hiệu theo ID
  async update(
    id: number,
    updateBrandDto: UpdateBrandDto,
    user: Users,
  ): Promise<Brands> {
    const brand = await this.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Không tìm thấy thương hiệu với ID ${id}.`);
    }

    try {
      await this.brandsRepository.update(id, {
        ...updateBrandDto,
        updatedBy: user.userId,
      });
      return this.findOne(id);
    } catch (error) {
      throw new BadRequestException('Không thể cập nhật thương hiệu.');
    }
  }

  // Xóa một thương hiệu theo ID
  async delete(id: number): Promise<void> {
    const brand = await this.findOne(id);
    if (!brand) {
      throw new NotFoundException(`Không tìm thấy thương hiệu với ID ${id}.`);
    }

    try {
      await this.brandsRepository.delete(id);
    } catch (error) {
      throw new BadRequestException('Không thể xóa thương hiệu.');
    }
  }
}
