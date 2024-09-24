// create-discount.dto.ts
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
      message: 'discountPercent must be a number with up to 2 decimal places.',
    },
  )
  @Min(0, { message: 'discountPercent must be a positive number.' })
  @IsNotEmpty({ message: 'discountPercent is required.' })
  discountPercent: number;

  @IsOptional()
  @Length(1, 255, {
    message: 'description must be between 1 and 255 characters.',
  })
  description?: string;

  @IsDateString({}, { message: 'startDate must be a valid date string.' })
  @IsNotEmpty({ message: 'startDate is required.' })
  startDate: string;

  @IsDateString({}, { message: 'endDate must be a valid date string.' })
  @IsNotEmpty({ message: 'endDate is required.' })
  endDate: string;

  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}
