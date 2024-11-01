import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request, Response } from 'express';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus } from '../enums/paymentStatus.enum';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('/checkout')
  async createCheckoutSession(
    @Body()
    body: {
      currency: string;
      orderId: number;
      products: { productName: string; unitAmount: number; quantity: number }[];
    },
  ) {
    return this.stripeService.createCheckoutSession(
      body.currency,
      body.orderId,
      body.products,
    );
  }

  @Post('/webhook')
  async handleStripeWebhook(
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = this.stripeService.constructEvent(
        request.body,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.log(`⚠️ Webhook signature verification failed.`, err.message);
      return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        await this.ordersService.updatePaymentOrderStatus(
          orderId,
          PaymentStatus.Paid,
        );
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        const failedOrderId = failedIntent.metadata.orderId;
        await this.ordersService.updatePaymentOrderStatus(
          failedOrderId,
          PaymentStatus.Failed,
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    response.status(200).send('Received');
  }
}
