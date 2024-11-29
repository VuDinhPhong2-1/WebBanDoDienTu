import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TempImages } from '../entities/TempImages';
import { TempImagesService } from '../temp-images/temp-images.service';
import { TempImagesModule } from '../temp-images/temp-images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TempImages]),
    TempImagesModule,
  ],
  providers: [CleanupService],
})
export class CleanupModule {}

