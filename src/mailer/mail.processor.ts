import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('email-queue')
export class MailProcessor {
  constructor(private readonly mailerService: MailerService) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { to, subject, template, context } = job.data;

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
      });
      // Log khi gửi email thành công
      console.log(`Email sent successfully to ${to} with subject: ${subject}`);
    } catch (error) {
      // Log khi có lỗi xảy ra
      console.error('Error sending email:', error);
    }

    // Log khi kết thúc xử lý công việc
    console.log('Finished processing email job.');
  }
}
