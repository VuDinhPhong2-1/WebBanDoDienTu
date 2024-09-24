import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsInt({ message: 'parentCategoryId must be an integer.' })
  parentCategoryId?: number;

  @IsOptional()
  @IsString({ message: 'Category name must be a string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean (true or false).' })
  isActive?: boolean;
}
