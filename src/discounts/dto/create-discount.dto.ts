import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Length,
  Min,
} from 'class-validator';

export class CreateDiscountDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: 'Phần trăm giảm giá phải là số và có tối đa 2 chữ số thập phân.',
    },
  )
  @Min(0, { message: 'Phần trăm giảm giá phải là một số dương.' })
  @IsNotEmpty({ message: 'Phần trăm giảm giá là bắt buộc.' })
  discountPercent: number;

  @IsOptional()
  @Length(1, 255, {
    message: 'Mô tả phải có độ dài từ 1 đến 255 ký tự.',
  })
  description?: string;

  @IsDateString({}, { message: 'Ngày bắt đầu phải là chuỗi ngày hợp lệ.' })
  @IsNotEmpty({ message: 'Ngày bắt đầu là bắt buộc.' })
  startDate: string;

  @IsDateString({}, { message: 'Ngày kết thúc phải là chuỗi ngày hợp lệ.' })
  @IsNotEmpty({ message: 'Ngày kết thúc là bắt buộc.' })
  endDate: string;

  @IsBoolean({ message: 'Trạng thái hoạt động phải là giá trị boolean.' })
  @IsOptional()
  isActive?: boolean;
}
