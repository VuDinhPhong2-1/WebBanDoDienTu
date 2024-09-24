import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Categories } from '../entities/Categories';
import { CreateCategoryDto } from './dto/create-categories.dto';
import { UpdateCategoryDto } from './dto/update-categories.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/customize';
import { Role } from '../enums/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard) // Bảo vệ các route với JWT và Roles Guard
@Roles(Role.ADMIN) // Chỉ cho phép Admin truy cập
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Tạo một category mới
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Categories> {
    return await this.categoriesService.create(createCategoryDto);
  }

  // Lấy tất cả categories
  @Get()
  async findAll(): Promise<Categories[]> {
    return await this.categoriesService.findAll();
  }

  // Lấy category theo ID
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Categories> {
    return await this.categoriesService.findOne(id);
  }

  // Cập nhật category theo ID
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  // Xóa category theo ID
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return await this.categoriesService.remove(id);
  }

  // Lấy categories con theo Parent Category ID
  @Get('parent/:parentId')
  async findByParentCategoryId(
    @Param('parentId') parentId: number,
  ): Promise<Categories[]> {
    return await this.categoriesService.findByParentCategoryId(parentId);
  }

  // Kích hoạt/Vô hiệu hóa category
  @Put(':id/toggle-status')
  async toggleStatus(@Param('id') id: number): Promise<Categories> {
    return await this.categoriesService.toggleStatus(id);
  }
}
