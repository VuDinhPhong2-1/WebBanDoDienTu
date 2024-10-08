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

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderDetails, Products, Orders, SalePrices, Discounts]),
    forwardRef(() => UsersModule),
    OrdersModule,
  ],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService, OrdersService],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}
