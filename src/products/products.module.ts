import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from '../entities/Products';
import { UsersModule } from '../users/users.module';
import { Discounts } from '../entities/Discounts';
import { SalePrices } from '../entities/SalePrices';
import { SalePricesModule } from '../sale-prices/sale-prices.module';
import { SalePricesService } from '../sale-prices/sale-prices.service';
import { Categories } from '../entities/Categories';
import { ProductCategories } from '../entities/ProductCategories';
import { ProductImagesService } from '../product-images/product-images.service';
import { ProductImages } from '../entities/ProductImages';
import { Brands } from '../entities/Brands';
import { CategoriesService } from '../categories/categories.service';
import { TempImagesService } from '../temp-images/temp-images.service';
import { TempImages } from '../entities/TempImages';
import { UploadService } from '../upload/upload.service';
import { CloudinaryService } from '../upload/cloudinary.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Products,
      Discounts,
      SalePrices,
      ProductCategories,
      Categories,
      ProductImages,
      Brands,
      TempImages
    ]),
    forwardRef(() => UsersModule),
    SalePricesModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    SalePricesService,
    ProductImagesService,
    CategoriesService,
    TempImagesService,
    UploadService,
    CloudinaryService
  ],
})
export class ProductsModule {}
