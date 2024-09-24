import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Để module config có thể dùng ở mọi nơi trong ứng dụng
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql', // Chỉ định rõ kiểu là mssql
        host: configService.get<string>('DATABASE_HOST'),
        port: parseInt(configService.get<string>('DATABASE_PORT'), 10),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true, // Tự động tải các entity
        synchronize: false, // Không dùng synchronize vì database đã có sẵn
        options: {
          encrypt: true, // mã hóa kết nối nếu cần
          trustServerCertificate: true, // Tắt kiểm tra chứng chỉ tự ký
          enableArithAbort: true,
        },
      }),
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
  ],
})
export class AppModule {}
