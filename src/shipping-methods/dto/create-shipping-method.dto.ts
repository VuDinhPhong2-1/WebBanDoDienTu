import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateShippingMethodDto {
  @IsString({ message: 'Tên phương thức phải là chuỗi ký tự.' })
  methodName: string;

  @IsNumber({}, { message: 'Chi phí phải là một số hợp lệ.' })
  cost: number;

  @IsString({ message: 'Thời gian giao hàng dự kiến phải là chuỗi ký tự.' })
  @IsOptional()
  estimatedDeliveryTime?: string;

  @IsString({ message: 'Hãng vận chuyển phải là chuỗi ký tự.' })
  @IsOptional()
  carrier?: string;

  @IsString({ message: 'URL theo dõi phải là chuỗi ký tự.' })
  @IsOptional()
  trackingUrl?: string;

  @IsNumber(
    {},
    { message: 'Giới hạn trọng lượng tối đa phải là một số hợp lệ.' },
  )
  @IsOptional()
  maxWeightLimit?: number;

  @IsBoolean({ message: 'Giá trị mặc định phải là kiểu boolean.' })
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu boolean.' })
  @IsOptional()
  activeStatus?: boolean;
}
