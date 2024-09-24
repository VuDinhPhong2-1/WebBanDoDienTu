// create-product.dto.ts
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Name must be a string.' })
  @Length(1, 100, { message: 'Name must be between 1 and 100 characters.' })
  @IsNotEmpty({ message: 'Name is required.' })
  name: string;

  @IsString({ message: 'Description must be a string.' })
  @Length(0, 255, { message: 'Description can be up to 255 characters.' })
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Quantity must be an integer.' })
  @IsNotEmpty({ message: 'Quantity is required.' })
  quantity: number;

  @IsInt({ message: 'Brand ID must be an integer.' })
  @IsNotEmpty({ message: 'Brand ID is required.' })
  brandId: number;

  @IsInt({ message: 'Discount ID must be an integer.' })
  @IsOptional()
  discountId?: number;
}
