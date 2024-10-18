import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  IsInt,
  ArrayUnique,
  IsOptional,
} from 'class-validator';
import { UpdateProductDto } from './update-product.dto';
import { CreateSalePriceDto } from '../../sale-prices/dto/create-sale-price.dto';

export class UpdateProductWithSalePriceAndCategoriesDto {
  @ValidateNested()
  @Type(() => UpdateProductDto)
  product: UpdateProductDto;

  @ValidateNested()
  @Type(() => CreateSalePriceDto)
  @IsOptional()
  salePrice?: CreateSalePriceDto;

  @IsArray({ message: 'Danh sách ID danh mục phải là một mảng.' })
  @IsOptional()
  @ArrayUnique({ message: 'Các ID danh mục phải là duy nhất.' })
  @IsInt({ each: true, message: 'Mỗi ID danh mục phải là một số nguyên.' })
  categoryIds?: number[];

  @IsArray({ message: 'Danh sách hình ảnh phải là một mảng.' })
  @ArrayUnique({ message: 'Hình ảnh phải là duy nhất.' })
  @IsOptional()
  images?: string[];
}
