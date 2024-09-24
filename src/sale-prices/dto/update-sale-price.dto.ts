import { IsNotEmpty, IsInt } from 'class-validator';
import { CreateSalePriceDto } from './create-sale-price.dto';

export class UpdateSalePriceDto extends CreateSalePriceDto {
  @IsInt()
  @IsNotEmpty()
  salePriceId: number;
}
