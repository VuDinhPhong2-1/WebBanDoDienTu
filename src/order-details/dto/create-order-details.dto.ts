import { IsNumber, IsOptional } from 'class-validator';

export class CreateOrderDetailsDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  orderId?: number;
}
