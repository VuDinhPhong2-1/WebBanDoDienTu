import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TempImagesService } from './temp-images.service';

@Controller('temp-images')
export class TempImagesController {
  constructor(private readonly tempImagesService: TempImagesService) {}

  // API để thêm ảnh tạm thời
  @Post()
  async addTempImage(@Body() body: { publicId: string; url: string }) {
    const { publicId, url } = body;
    const result = await this.tempImagesService.addTempImage(publicId, url);
    console.log(result);
  
    return result;
  }
  

  // API để lấy tất cả ảnh tạm
  @Get()
  async getAllTempImages() {
    return this.tempImagesService.getAllTempImages();
  }

  // API để xóa ảnh tạm theo publicId
  // temp-images.controller.ts
  @Delete()
  async deleteTempImages(@Query('publicIds') publicIds: string[]) {
    if (!Array.isArray(publicIds)) {
      throw new BadRequestException('publicIds must be an array');
    }
    await this.tempImagesService.deleteTempImages(publicIds);
  }

  // API để dọn dẹp ảnh quá hạn
  @Post('cleanup')
  async cleanupExpiredImages(@Body('expiredDate') expiredDate: string) {
    const date = new Date(expiredDate);
    return this.tempImagesService.cleanupExpiredImages(date);
  }
}
