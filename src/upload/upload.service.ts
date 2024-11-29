import { Injectable } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.config';

@Injectable()
export class UploadService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ publicId: string; url: string }> {
    return await this.cloudinary.uploadImage(file);
  }
}
