import { forwardRef, Module } from '@nestjs/common';
import { OrderDetailsService } from './order-details.service';
import { OrderDetailsController } from './order-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetails } from '../entities/OrderDetails';
import { UsersModule } from '../users/users.module';
import { Products } from '../entities/Products';
import { OrdersModule } from '../orders/orders.module';
import { OrdersService } from '../orders/orders.service';
import { Orders } from '../entities/Orders';
import { SalePrices } from '../entities/SalePrices';
import { Discounts } from '../entities/Discounts';
import { ProductsService } from '../products/products.service';
import { ProductCategories } from '../entities/ProductCategories';
import { Categories } from '../entities/Categories';
import { Brands } from '../entities/Brands';
import { SalePricesService } from '../sale-prices/sale-prices.service';
import { ProductImagesService } from '../product-images/product-images.service';
import { ProductImages } from '../entities/ProductImages';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { PaymentMethods } from '../entities/PaymentMethods';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderDetails,
      Products,
      Orders,
      SalePrices,
      Discounts,
      ProductCategories,
      Categories,
      Brands,
      ProductImages,
      PaymentMethods,
    ]),
    forwardRef(() => UsersModule),
    OrdersModule,
  ],
  controllers: [OrderDetailsController],
  providers: [
    OrderDetailsService,
    OrdersService,
    ProductsService,
    SalePricesService,
    ProductImagesService,
    PaymentMethodsService,
  ],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}
