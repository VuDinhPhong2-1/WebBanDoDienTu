import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from '../entities/Categories';
import { UsersModule } from '../users/users.module';
import { ProductCategories } from '../entities/ProductCategories';

@Module({
  imports: [
    TypeOrmModule.forFeature([Categories, ProductCategories]),
    forwardRef(() => UsersModule),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
