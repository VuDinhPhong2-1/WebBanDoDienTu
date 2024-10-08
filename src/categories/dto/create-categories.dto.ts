import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @IsOptional()
  @IsInt({ message: 'Mã danh mục cha phải là số nguyên.' })
  parentCategoryId?: number;

  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự.' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự.' })
  description?: string;

  @IsOptional()
  @IsBoolean({
    message: 'Trạng thái hoạt động phải là kiểu boolean (true hoặc false).',
  })
  isActive?: boolean;
}
