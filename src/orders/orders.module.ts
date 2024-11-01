import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from '../entities/Orders';
import { OrderDetails } from '../entities/OrderDetails';
import { Products } from '../entities/Products';
import { SalePrices } from '../entities/SalePrices';
import { Discounts } from '../entities/Discounts';
import { UsersModule } from '../users/users.module';
import { OrderDetailsService } from '../order-details/order-details.service';
import { ProductsService } from '../products/products.service';
import { ProductCategories } from '../entities/ProductCategories';
import { Categories } from '../entities/Categories';
import { Brands } from '../entities/Brands';
import { SalePricesService } from '../sale-prices/sale-prices.service';
import { ProductImagesService } from '../product-images/product-images.service';
import { ProductImages } from '../entities/ProductImages';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';
import { PaymentMethods } from '../entities/PaymentMethods';
import { MailerModule } from '../mailer/mailer.module'; // Import MailerModule

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orders,
      OrderDetails,
      Products,
      SalePrices,
      Discounts,
      ProductCategories,
      Categories,
      Brands,
      SalePrices,
      ProductImages,
      PaymentMethods,
    ]),
    forwardRef(() => UsersModule),
    MailerModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderDetailsService,
    ProductsService,
    SalePricesService,
    ProductImagesService,
    PaymentMethodsService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
