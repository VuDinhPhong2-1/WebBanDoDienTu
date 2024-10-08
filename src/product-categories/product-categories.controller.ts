import { Controller, Post, Delete, Param, Get, Body } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';

@Controller('product-categories')
export class ProductCategoriesController {
  constructor(
    private readonly productCategoriesService: ProductCategoriesService,
  ) {}

  // Thêm sản phẩm vào danh mục
  @Post(':productId/categories/:categoryId')
  async addProductToCategory(
    @Param('productId') productId: number,
    @Param('categoryId') categoryId: number,
    @Body('userId') userId: number,
  ) {
    return await this.productCategoriesService.addProductToCategory(
      productId,
      categoryId,
      userId,
    );
  }

  // Xóa sản phẩm khỏi danh mục
  @Delete(':productId/categories/:categoryId')
  async removeProductFromCategory(
    @Param('productId') productId: number,
    @Param('categoryId') categoryId: number,
  ) {
    return await this.productCategoriesService.removeProductFromCategory(
      productId,
      categoryId,
    );
  }

  // Lấy danh sách danh mục của một sản phẩm
  @Get(':productId/categories')
  async findCategoriesByProductId(@Param('productId') productId: number) {
    return await this.productCategoriesService.findCategoriesByProductId(
      productId,
    );
  }

  // Lấy danh sách sản phẩm theo danh mục
  @Get('categories/:categoryId/products')
  async findProductsByCategoryId(@Param('categoryId') categoryId: number) {
    return await this.productCategoriesService.findProductsByCategoryId(
      categoryId,
    );
  }
}
