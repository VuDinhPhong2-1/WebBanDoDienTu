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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Products,
      Discounts,
      SalePrices,
      ProductCategories,
      Categories,
    ]),
    forwardRef(() => UsersModule),
    SalePricesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, SalePricesService],
})
export class ProductsModule {}
