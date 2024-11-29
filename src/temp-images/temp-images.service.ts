import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LessThan } from 'typeorm';
import { TempImages } from '../entities/TempImages';

@Injectable()
export class TempImagesService {
  constructor(
    @InjectRepository(TempImages)
    private tempImagesRepository: Repository<TempImages>,
  ) {}

  // Tải ảnh tạm thời vào cơ sở dữ liệu
  async addTempImage(publicId: string, url: string): Promise<TempImages> {
    const tempImage = this.tempImagesRepository.create({
      publicId,
      url,
    });

    return this.tempImagesRepository.save(tempImage);
  }

  // Lấy tất cả ảnh tạm thời
  async getAllTempImages(): Promise<TempImages[]> {
    return this.tempImagesRepository.find();
  }

  // Xóa ảnh tạm bằng publicId
  async deleteTempImages(publicIds: string[]): Promise<void> {
    await this.tempImagesRepository.delete({ publicId: In(publicIds) });
  }

  // Dọn dẹp ảnh tạm đã quá hạn
  async cleanupExpiredImages(expiredDate: Date): Promise<TempImages[]> {
    const expiredImages = await this.tempImagesRepository.find({
      where: { createdAt: LessThan(expiredDate) },
    });

    for (const image of expiredImages) {
      // Thêm logic xóa ảnh khỏi Cloudinary nếu cần thiết
      console.log(`Deleting image from Cloudinary: ${image.publicId}`);
    }

    // Xóa khỏi database
    await this.tempImagesRepository.remove(expiredImages);

    return expiredImages;
  }
}
