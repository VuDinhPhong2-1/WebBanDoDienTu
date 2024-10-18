import { forwardRef, Module } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { ProductImagesController } from './product-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductImages } from '../entities/ProductImages';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductImages]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ProductImagesController],
  providers: [ProductImagesService],
  exports: [ProductImagesService],
})
export class ProductImagesModule {}
