// create-product-with-sale-price-and-categories.dto.ts
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  ArrayUnique,
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

  @IsArray()
  @ArrayNotEmpty({ message: 'Category IDs cannot be empty.' })
  @ArrayUnique({ message: 'Category IDs must be unique.' })
  @IsInt({ each: true, message: 'Each category ID must be an integer.' })
  categoryIds: number[];
}
