import { forwardRef, Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethods } from '../entities/PaymentMethods';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethods]),
    forwardRef(() => UsersModule),
  ],
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
