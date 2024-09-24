import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from '../entities/Categories';
import { CreateCategoryDto } from './dto/create-categories.dto';
import { UpdateCategoryDto } from './dto/update-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
  ) {}

  // Tạo một category mới
  async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
    const newCategory = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(newCategory);
  }

  // Lấy tất cả categories
  async findAll(): Promise<Categories[]> {
    return await this.categoriesRepository.find();
  }

  // Lấy category theo ID
  async findOne(id: number): Promise<Categories> {
    return await this.categoriesRepository.findOne({
      where: { categoryId: id },
    });
  }

  // Cập nhật category theo ID
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    const category = await this.categoriesRepository.findOne({
      where: { categoryId: id },
    });
    if (category) {
      Object.assign(category, updateCategoryDto);
      return await this.categoriesRepository.save(category);
    }
    return null;
  }

  // Xóa category theo ID
  async remove(id: number): Promise<void> {
    await this.categoriesRepository.delete(id);
  }

  // Lấy các categories con theo Parent ID
  async findByParentCategoryId(parentId: number): Promise<Categories[]> {
    return await this.categoriesRepository.find({
      where: { parentCategoryId: parentId },
    });
  }

  // Kích hoạt/Vô hiệu hóa category
  async toggleStatus(id: number): Promise<Categories> {
    const category = await this.categoriesRepository.findOne({
      where: { categoryId: id },
    });
    if (category) {
      category.isActive = !category.isActive;
      return await this.categoriesRepository.save(category);
    }
    return null;
  }
}
