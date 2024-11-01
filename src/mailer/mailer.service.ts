import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MailerService {
  constructor(@InjectQueue('email-queue') private readonly emailQueue: Queue) {}

  async sendOrderConfirmationEmail(to: string, orderDetails: any) {
    await this.emailQueue.add('send-email', {
      to,
      subject: 'Order Confirmation',
      template: 'confirmation.hbs',
      context: { orderDetails },
    });
    console.log('Added email job to the queue for:', to);
  }
}
