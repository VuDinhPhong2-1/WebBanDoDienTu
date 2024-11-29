import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ publicId: string; url: string }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'uploads' }, (error, result) => {
          if (error) return reject(error);
          resolve({
            publicId: result.public_id, // Trả về public_id
            url: result.secure_url, // Trả về URL ảnh
          });
        })
        .end(file.buffer);
    });
  }
}
