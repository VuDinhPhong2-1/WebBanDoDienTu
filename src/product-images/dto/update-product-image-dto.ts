import { IsArray, IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateProductWithImagesDto {
  @IsArray({ message: 'Danh sách ID ảnh phải là một mảng.' })
  @IsOptional()
  imageIdsToRemove?: number[];

  @IsArray({ message: 'Danh sách hình ảnh mới phải là một mảng.' })
  @IsOptional()
  @IsString({ each: true, message: 'Mỗi URL hình ảnh phải là chuỗi ký tự.' })
  images?: string[];
}
