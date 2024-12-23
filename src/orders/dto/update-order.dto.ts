import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { OrderStatus } from '../../enums/orderStatus.enum';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}
