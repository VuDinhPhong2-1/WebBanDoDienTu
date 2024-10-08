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
  @IsDate({ message: 'Ngày đơn hàng phải là một ngày hợp lệ.' })
  orderDate?: Date;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Tổng số tiền phải là một số hợp lệ với tối đa 2 chữ số thập phân.',
    },
  )
  @IsOptional()
  totalAmount?: number;

  @IsString({ message: 'Số theo dõi phải là một chuỗi ký tự.' })
  @IsOptional()
  trackingNumber?: string;

  @IsString({ message: 'Địa chỉ giao hàng phải là một chuỗi ký tự.' })
  @IsOptional()
  shippingAddress?: string;

  @IsString({ message: 'Địa chỉ thanh toán phải là một chuỗi ký tự.' })
  @IsOptional()
  billingAddress?: string;

  @IsNumber({}, { message: 'ID phương thức thanh toán phải là một số.' })
  @IsOptional()
  paymentMethodId?: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'Phần trăm chiết khấu phải là một số hợp lệ với tối đa 2 chữ số thập phân.',
    },
  )
  @IsOptional()
  discountPercent?: number;

  @IsNumber({}, { message: 'ID phương thức vận chuyển phải là một số.' })
  @IsOptional()
  shippingMethodId?: number;

  @ValidateNested({ each: true, message: 'Chi tiết đơn hàng không hợp lệ.' })
  @Type(() => CreateOrderDetailsDto) // Validate danh sách các chi tiết đơn hàng
  orderDetails: CreateOrderDetailsDto[];
}
