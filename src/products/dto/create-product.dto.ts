import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là một chuỗi ký tự.' })
  @Length(1, 100, {
    message: 'Tên sản phẩm phải có độ dài từ 1 đến 100 ký tự.',
  })
  @IsNotEmpty({ message: 'Tên sản phẩm là bắt buộc.' })
  name: string;

  @IsString({ message: 'Mô tả sản phẩm phải là một chuỗi ký tự.' })
  @Length(0, 255, { message: 'Mô tả sản phẩm có thể có tối đa 255 ký tự.' })
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Số lượng phải là một số nguyên.' })
  @IsNotEmpty({ message: 'Số lượng là bắt buộc.' })
  quantity: number;

  @IsInt({ message: 'ID thương hiệu phải là một số nguyên.' })
  @IsNotEmpty({ message: 'ID thương hiệu là bắt buộc.' })
  brandId: number;

  @IsInt({ message: 'ID chiết khấu phải là một số nguyên.' })
  @IsOptional()
  discountId?: number;

  @IsString({ message: 'avatar url.' })
  @Length(0, 255, { message: 'avatar url có thể có tối đa 255 ký tự.' })
  @IsOptional()
  avatarUrl?: string;
}
