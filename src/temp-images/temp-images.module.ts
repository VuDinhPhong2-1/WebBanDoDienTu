import { Module } from '@nestjs/common';
import { TempImagesService } from './temp-images.service';
import { TempImagesController } from './temp-images.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TempImages } from '../entities/TempImages';

@Module({
  imports: [TypeOrmModule.forFeature([TempImages])],
  controllers: [TempImagesController],
  providers: [TempImagesService],
  exports: [TempImagesService],
})
export class TempImagesModule {}
