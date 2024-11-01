import { Module } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MailerService } from './mailer.service';
import { MailProcessor } from './mail.processor';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    NestMailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_AUTH_USER'),
            pass: configService.get<string>('EMAIL_AUTH_PASS'),
          },
        },
        template: {
          dir: join(process.cwd(), 'templates'), // Đường dẫn tuyệt đối đến thư mục templates ở cấp dự án
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService, MailProcessor],
  exports: [MailerService],
})
export class MailerModule {}
