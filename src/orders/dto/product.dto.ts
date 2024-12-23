import { IsNumber } from 'class-validator';

export class ProductOrderDto {
  @IsNumber({}, { message: 'productId phải là một số.' })
  productId: number;

  @IsNumber({}, { message: 'Số lượng phải là một số.' })
  quantity: number;
}
