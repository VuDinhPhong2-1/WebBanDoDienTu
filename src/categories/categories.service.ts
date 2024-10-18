import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Categories } from '../entities/Categories';
import { CreateCategoryDto } from './dto/create-categories.dto';
import { UpdateCategoryDto } from './dto/update-categories.dto';
import { ProductCategories } from '../entities/ProductCategories';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,

    @InjectRepository(ProductCategories)
    private productCategoriesRepository: Repository<ProductCategories>,
  ) {}

  // Tạo một category mới
  async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
    try {
      const newCategory = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(newCategory);
    } catch (error) {
      throw new BadRequestException('Không thể tạo danh mục.');
    }
  }

  // Lấy tất cả categories
  async findAll(): Promise<Categories[]> {
    try {
      return await this.categoriesRepository.find();
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách danh mục.');
    }
  }

  // Lấy category theo ID
  async findOne(id: number): Promise<Categories> {
    const category = await this.categoriesRepository.findOne({
      where: { categoryId: id },
    });
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}.`);
    }
    return category;
  }

  // Cập nhật category theo ID
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    const category = await this.findOne(id);
    if (category) {
      Object.assign(category, updateCategoryDto);
      return await this.categoriesRepository.save(category);
    } else {
      throw new NotFoundException(
        `Không thể cập nhật, danh mục với ID ${id} không tồn tại.`,
      );
    }
  }

  // Xóa category theo ID
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    if (category) {
      await this.categoriesRepository.delete(id);
    } else {
      throw new NotFoundException(
        `Không thể xóa, danh mục với ID ${id} không tồn tại.`,
      );
    }
  }

  // Lấy các categories con theo Parent ID
  async findByParentCategoryId(parentId: number): Promise<Categories[]> {
    try {
      return await this.categoriesRepository.find({
        where: { parentCategoryId: parentId },
      });
    } catch (error) {
      throw new BadRequestException(
        `Không thể lấy danh sách danh mục con cho danh mục cha với ID ${parentId}.`,
      );
    }
  }

  // Kích hoạt/Vô hiệu hóa category
  async toggleStatus(id: number): Promise<Categories> {
    const category = await this.findOne(id);
    if (category) {
      category.isActive = !category.isActive;
      return await this.categoriesRepository.save(category);
    } else {
      throw new NotFoundException(
        `Không thể cập nhật trạng thái, danh mục với ID ${id} không tồn tại.`,
      );
    }
  }
  async getLevelTwoCategories(
    name: string,
  ): Promise<{ id: number; name: string }[]> {
    const result = await this.categoriesRepository.query(
      `
      WITH CategoryTree AS (
          SELECT CategoryID, 1 AS Level
          FROM Categories
          WHERE Name = @0
      
          UNION ALL
          
          SELECT c.CategoryID, ct.Level + 1 AS Level
          FROM Categories c
          INNER JOIN CategoryTree ct ON c.ParentCategoryID = ct.CategoryID
          WHERE ct.Level = 1
      )
      SELECT DISTINCT c.CategoryID, c.Name AS CategoryName
      FROM Categories c
      JOIN ProductCategories pc ON c.CategoryID = pc.CategoryID
      JOIN CategoryTree ct ON pc.CategoryID = ct.CategoryID
      WHERE ct.Level = 2;
    `,
      [name],
    );

    return result.map((row) => ({
      id: row.CategoryID,
      name: row.CategoryName,
    }));
  }

  async findCategoryLevel2(categoryName: string): Promise<any> {
    const categoryIdLevel1 = await this.categoriesRepository.findOne({
      where: {
        name: categoryName,
      },
    });
    if (!categoryIdLevel1)
      throw new NotFoundException(
        `Không thể tìm thấy categoryvới tên ${categoryName} không tồn tại.`,
      );

    const categoriesIdLevel2 = await this.categoriesRepository.find({
      where: {
        parentCategoryId: categoryIdLevel1.categoryId,
      },
    });

    return categoriesIdLevel2;
  }
}
