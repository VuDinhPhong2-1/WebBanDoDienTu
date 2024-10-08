import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsInt,
} from 'class-validator';

export class CreateSalePriceDto {
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Giá phải là một số và có tối đa 2 chữ số thập phân.' },
  )
  @IsNotEmpty({ message: 'Giá là bắt buộc.' })
  price: number;

  @IsDateString({}, { message: 'Ngày bắt đầu phải là một chuỗi ngày hợp lệ.' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'Ngày kết thúc phải là một chuỗi ngày hợp lệ.' })
  @IsOptional()
  endDate?: string;

  @IsDateString({}, { message: 'Ngày áp dụng phải là một chuỗi ngày hợp lệ.' })
  @IsOptional()
  applyDate?: string;

  // Product ID không bắt buộc vì sẽ được đặt từ phía server
  @IsInt({ message: 'Mã sản phẩm phải là một số nguyên.' })
  @IsOptional()
  productId?: number;
}
