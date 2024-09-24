import { IsInt, IsNotEmpty } from 'class-validator';
import { CreateDiscountDto } from './create-discount.dto';

export class UpdateDiscountDto extends CreateDiscountDto {
  @IsInt()
  @IsNotEmpty()
  discountId: number;
}
