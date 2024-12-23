import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductOrderDto } from './product.dto';

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
  totalAmount: number;

  @IsString({ message: 'Địa chỉ giao hàng phải là một chuỗi ký tự.' })
  @IsOptional()
  shippingAddress?: string;

  @IsString({ message: 'Tên phương thức thanh toán phải là một chuỗi.' })
  @IsOptional()
  paymentMethodName?: string;

  @IsString({ message: 'Tên khách hàng phải là một chuỗi ký tự.' })
  customerName: string;

  @IsString({ message: 'Số điện thoại khách hàng phải là một chuỗi ký tự.' })
  @IsOptional()
  customerPhone?: string;

  @IsArray({ message: 'Danh sách sản phẩm phải là một mảng.' })
  @ArrayNotEmpty({ message: 'Danh sách sản phẩm không được để trống.' })
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products: ProductOrderDto[];
}
