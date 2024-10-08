import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { ProductCategories } from '../entities/ProductCategories';
import { Products } from '../entities/Products';
import { Categories } from '../entities/Categories';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCategories, Products, Categories]),
  ],
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService],
  exports: [ProductCategoriesService],
})
export class ProductCategoriesModule {}
