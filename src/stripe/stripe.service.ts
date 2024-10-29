// stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  }

  async createCheckoutSession(
    currency: string,
    orderId: number,
    products: { productName: string; unitAmount: number; quantity: number }[],
  ) {
    const lineItems = products.map((product) => {
      console.log('Product:', product.productName);
      console.log('Unit Amount:', product.unitAmount);
      console.log('Quantity:', product.quantity);

      return {
        price_data: {
          currency: currency,
          product_data: {
            name: product.productName,
          },
          unit_amount: product.unitAmount,
        },
        quantity: product.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:3000/order-success/${orderId}`,
      cancel_url: `http://localhost:3000/order-cancel/${orderId}`,
      payment_intent_data: {
        metadata: { orderId: orderId.toString() }, // Thêm metadata vào đây
      },
    });

    console.log('Stripe Session:', session);
    return session;
  }

  constructEvent(
    rawBody: Buffer,
    sig: string | string[],
    endpointSecret: string,
  ) {
    return this.stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  }
}
