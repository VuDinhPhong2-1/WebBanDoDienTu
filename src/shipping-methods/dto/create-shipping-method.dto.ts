import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateShippingMethodDto {
  @IsString({ message: 'MethodName must be a string.' })
  methodName: string;

  @IsNumber({}, { message: 'Cost must be a vaFlid number.' })
  cost: number;

  @IsString({ message: 'EstimatedDeliveryTime must be a string.' })
  @IsOptional()
  estimatedDeliveryTime?: string;

  @IsString({ message: 'Carrier must be a string.' })
  @IsOptional()
  carrier?: string;

  @IsString({ message: 'TrackingURL must be a string.' })
  @IsOptional()
  trackingUrl?: string;

  @IsNumber({}, { message: 'MaxWeightLimit must be a valid number.' })
  @IsOptional()
  maxWeightLimit?: number;

  @IsBoolean({ message: 'IsDefault must be a boolean value.' })
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean({ message: 'ActiveStatus must be a boolean value.' })
  @IsOptional()
  activeStatus?: boolean;
}
