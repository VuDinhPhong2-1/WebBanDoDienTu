import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString({ message: 'Brand name must be a string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Country must be a string.' })
  country?: string;
}
