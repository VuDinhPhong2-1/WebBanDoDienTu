import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateProductImageDto {
  @IsInt({ message: 'ID sản phẩm phải là một số nguyên.' })
  @IsNotEmpty({ message: 'ID sản phẩm là bắt buộc.' })
  productId: number;

  @IsString({ message: 'URL của hình ảnh phải là một chuỗi ký tự.' })
  @IsNotEmpty({ message: 'URL của hình ảnh là bắt buộc.' })
  imageUrl: string;
}
