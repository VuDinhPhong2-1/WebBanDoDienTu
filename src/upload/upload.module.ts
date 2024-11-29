import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryService } from './cloudinary.config';

@Module({
  providers: [UploadService, CloudinaryService],
  controllers: [UploadController],
  exports: [CloudinaryService,UploadService],
})
export class UploadModule {}
