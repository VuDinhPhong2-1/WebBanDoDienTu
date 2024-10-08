// products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductWithSalePriceAndCategoriesDto } from './dto/create-product-with-sale-price-and-categories.dto';
import { UpdateProductWithSalePriceAndCategoriesDto } from './dto/update-product-with-sale-price-and-categories.dto';
import { Users } from '../entities/Users';
import { Roles, User } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Get('/category/:name')
  async findProductsByCategory(@Param('name') category: string) {
    return this.productsService.findProductsByRecursiveCategory(category);
  }

  @Get('/')
  async findAll() {
    return this.productsService.findAll();
  }
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body()
    createProductWithSalePriceAndCategoriesDto: CreateProductWithSalePriceAndCategoriesDto,
    @User() user: Users,
  ) {
    return this.productsService.create(
      createProductWithSalePriceAndCategoriesDto,
      user,
    );
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updateProductWithSalePriceAndCategoriesDto: UpdateProductWithSalePriceAndCategoriesDto,
    @User() user: Users,
  ) {
    return this.productsService.update(
      id,
      updateProductWithSalePriceAndCategoriesDto,
      user,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    await this.productsService.remove(id);
    return { message: 'Sản phẩm đã được xóa thành công' };
  }
}
