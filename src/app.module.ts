import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthsModule } from './auths/auths.module';
import { UserRolesModule } from './user-roles/user-roles.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { DiscountsModule } from './discounts/discounts.module';
import { SalePricesModule } from './sale-prices/sale-prices.module';
import { ProductsModule } from './products/products.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { ShippingMethodsModule } from './shipping-methods/shipping-methods.module';
import { OrdersModule } from './orders/orders.module';
import { OrderDetailsModule } from './order-details/order-details.module';
import { ProductImagesModule } from './product-images/product-images.module';
import { MomoPaymentModule } from './momo-payment/momo-payment.module';
import { StripeModule } from './stripe/stripe.module';
import { MailerModule } from './mailer/mailer.module';
import { UploadModule } from './upload/upload.module';
import { TempImagesModule } from './temp-images/temp-images.module';
import { CleanupModule } from './cleanup/cleanup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT'), 10),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      }),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    UsersModule,
    RolesModule,
    AuthsModule,
    UserRolesModule,
    CategoriesModule,
    BrandsModule,
    DiscountsModule,
    SalePricesModule,
    ProductsModule,
    ProductCategoriesModule,
    PaymentMethodsModule,
    ShippingMethodsModule,
    OrdersModule,
    OrderDetailsModule,
    ProductImagesModule,
    MomoPaymentModule,
    StripeModule,
    MailerModule,
    UploadModule,
    TempImagesModule,
    CleanupModule,
  ],
})
export class AppModule {}
