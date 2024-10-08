import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString({ message: 'Tên phương thức thanh toán phải là một chuỗi ký tự.' })
  name: string;

  @IsString({ message: 'Mô tả phải là một chuỗi ký tự.' })
  @IsOptional()
  description?: string;

  @IsBoolean({ message: 'Trạng thái hoạt động phải là một giá trị boolean.' })
  @IsOptional()
  isActive?: boolean;
}
