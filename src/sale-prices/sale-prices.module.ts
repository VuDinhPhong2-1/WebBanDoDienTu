import { forwardRef, Module } from '@nestjs/common';
import { SalePricesService } from './sale-prices.service';
import { SalePricesController } from './sale-prices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalePrices } from '../entities/SalePrices';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalePrices]),
    forwardRef(() => UsersModule),
  ],
  controllers: [SalePricesController],
  providers: [SalePricesService],
  exports: [SalePricesService],
})
export class SalePricesModule {}
