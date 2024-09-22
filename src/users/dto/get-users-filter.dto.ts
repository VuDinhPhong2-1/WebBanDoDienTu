import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersFilterDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  username?: string;

  @IsOptional()
  email?: string;
}
