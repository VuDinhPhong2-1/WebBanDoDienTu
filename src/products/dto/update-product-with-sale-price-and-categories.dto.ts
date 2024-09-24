// update-product-with-sale-price-and-categories.dto.ts
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
  salePrice?: CreateSalePriceDto;

  @IsArray()
  @IsOptional()
  @ArrayUnique({ message: 'Category IDs must be unique.' })
  @IsInt({ each: true, message: 'Each category ID must be an integer.' })
  categoryIds?: number[];
}
