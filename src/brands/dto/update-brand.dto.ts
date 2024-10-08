import { IsString, IsOptional } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString({ message: 'Tên thương hiệu phải là chuỗi ký tự.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Quốc gia phải là chuỗi ký tự.' })
  country?: string;
}
