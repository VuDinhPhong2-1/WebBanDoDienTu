import { Type } from 'class-transformer';
import { ValidateNested, IsInt, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { CreateSalePriceDto } from '../../sale-prices/dto/create-sale-price.dto';

export class CreateProductWithSalePriceAndCategoriesDto {
  @ValidateNested()
  @Type(() => CreateProductDto)
  product: CreateProductDto;

  @ValidateNested()
  @Type(() => CreateSalePriceDto)
  salePrice: CreateSalePriceDto;

  @IsInt({ message: 'ID danh mục phải là một số nguyên.' })
  categoryId: number; // Đổi từ categoryIds thành categoryId
}
