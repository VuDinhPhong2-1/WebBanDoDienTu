import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductImages } from '../entities/ProductImages';
import { Users } from '../entities/Users';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImages)
    private readonly productImagesRepository: Repository<ProductImages>,
  ) {}

  // Tạo nhiều ảnh sản phẩm
  async createImages(productId: number, images: string[], user: Users) {
    if (images && images.length > 0) {
      const productImages = images.map((imageUrl) => ({
        productId,
        imageUrl,
        createdBy: user.userId,
      }));
      return await this.productImagesRepository.insert(productImages);
    }
    return;
  }

  // Xóa tất cả ảnh theo productId
  async removeImagesByProductId(productId: number) {
    return await this.productImagesRepository.delete({ productId });
  }

  // Lấy tất cả hình ảnh theo productId
  async findImagesByProductId(productId: number) {
    const images = await this.productImagesRepository.find({
      where: { productId },
    });

    return images;
  }

  async findImagesByProductIds(productIds: number[]) {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    const images = await this.productImagesRepository.find({
      where: { productId: In(productIds) },
    });

    return images;
  }
}
