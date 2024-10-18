import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  ArrayUnique,
  IsOptional,
} from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { CreateSalePriceDto } from '../../sale-prices/dto/create-sale-price.dto';

export class CreateProductWithSalePriceAndCategoriesDto {
  @ValidateNested()
  @Type(() => CreateProductDto)
  product: CreateProductDto;

  @ValidateNested()
  @Type(() => CreateSalePriceDto)
  salePrice: CreateSalePriceDto;

  @IsArray({ message: 'Danh sách ID danh mục phải là một mảng.' })
  @ArrayNotEmpty({ message: 'Danh sách ID danh mục không được để trống.' })
  @ArrayUnique({ message: 'Các ID danh mục phải là duy nhất.' })
  @IsInt({ each: true, message: 'Mỗi ID danh mục phải là một số nguyên.' })
  categoryIds: number[];

  @IsArray({ message: 'Danh sách hình ảnh phải là một mảng.' })
  @ArrayUnique({ message: 'Hình ảnh phải là duy nhất.' })
  @IsOptional()
  images?: string[];
}
