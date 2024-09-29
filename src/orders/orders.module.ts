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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orders,
      OrderDetails,
      Products,
      SalePrices,
      Discounts,
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderDetailsService],
})
export class OrdersModule {}
