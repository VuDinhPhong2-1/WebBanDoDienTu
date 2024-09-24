// create-sale-price.dto.ts
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
    { message: 'Price must be a number with up to 2 decimal places.' },
  )
  @IsNotEmpty({ message: 'Price is required.' })
  price: number;

  @IsDateString({}, { message: 'Start date must be a valid date string.' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'End date must be a valid date string.' })
  @IsOptional()
  endDate?: string;

  @IsDateString({}, { message: 'Apply date must be a valid date string.' })
  @IsOptional()
  applyDate?: string;

  // Make productId optional since it will be set server-side
  @IsInt({ message: 'Product ID must be an integer.' })
  @IsOptional()
  productId?: number;
}
