import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { TempImages } from '../entities/TempImages';

@Injectable()
export class CleanupService {
  constructor(
    @InjectRepository(TempImages)
    private tempImageRepository: Repository<TempImages>,
  ) {}

  @Cron('0 0 * * *') // Chạy vào lúc 0:00 mỗi ngày
  async cleanupUnusedImages() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Lấy các ảnh trong bảng tạm đã quá hạn
    const unusedImages = await this.tempImageRepository.find({
      where: { createdAt: LessThan(twentyFourHoursAgo) },
    });

    // Xóa các ảnh khỏi Cloudinary
    for (const image of unusedImages) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
        console.log(`Deleted image: ${image.publicId}`);
      } catch (error) {
        console.error(`Failed to delete image ${image.publicId}:`, error);
      }
    }

    // Xóa các bản ghi khỏi bảng tạm
    await this.tempImageRepository.remove(unusedImages);

    console.log(`Cleaned up ${unusedImages.length} unused images.`);
  }
}
