import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderDetailsDto } from '../../order-details/dto/create-order-details.dto';

export class CreateOrderDto {
  @IsOptional()
  @Type(() => Date) // Sử dụng class-transformer để biến đổi chuỗi thành Date
  @IsDate({ message: 'orderDate must be a valid date.' })
  orderDate?: Date;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'totalAmount must be a valid number with up to 2 decimal places.',
    },
  )
  @IsOptional()
  totalAmount?: number;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsNumber()
  @IsOptional()
  paymentMethodId?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'discountPercent must be a valid number with up to 2 decimal places.',
    },
  )
  @IsOptional()
  discountPercent?: number;

  @IsNumber()
  @IsOptional()
  shippingMethodId?: number;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailsDto) // Validate danh sách các chi tiết đơn hàng
  orderDetails: CreateOrderDetailsDto[];
}
