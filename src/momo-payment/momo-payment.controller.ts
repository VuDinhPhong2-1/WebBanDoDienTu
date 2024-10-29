import { Body, Controller, Post } from '@nestjs/common';
import { MomoPaymentService } from './momo-payment.service';
import { MomoPayment } from '../entities/MoMoPayment';

@Controller('momo-payment')
export class MomoPaymentController {
  constructor(private readonly momoPaymentService: MomoPaymentService) {}

  @Post('/payment')
  async createPayment(
    @Body('amount') amount: number,
    @Body('orderIdURL') orderIdURL: number,
  ) {
    return this.momoPaymentService.payment(amount, orderIdURL);
  }

  @Post('/create')
  async create(@Body() paymentData: Partial<MomoPayment>) {
    return this.momoPaymentService.createPayment(paymentData);
  }
}
