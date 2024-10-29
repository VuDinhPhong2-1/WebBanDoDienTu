import { forwardRef, Module } from '@nestjs/common';
import { MomoPaymentService } from './momo-payment.service';
import { MomoPaymentController } from './momo-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { MomoPayment } from '../entities/MoMoPayment';

@Module({
  imports: [
    TypeOrmModule.forFeature([MomoPayment]),
    forwardRef(() => UsersModule),
  ],
  controllers: [MomoPaymentController],
  providers: [MomoPaymentService],
})
export class MomoPaymentModule {}
