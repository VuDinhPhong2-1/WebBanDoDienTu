import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUsersFilterDto {
  @IsOptional()
  @IsNumber({}, { message: 'Giới hạn phải là một số.' })
  @Type(() => Number)
  @Min(1, { message: 'Giới hạn phải lớn hơn hoặc bằng 1.' })
  limit?: number = 10;

  @IsOptional()
  @IsNumber({}, { message: 'Trang phải là một số.' })
  @Type(() => Number)
  @Min(1, { message: 'Trang phải lớn hơn hoặc bằng 1.' })
  page?: number = 1;

  @IsOptional()
  username?: string;

  @IsOptional()
  email?: string;
}
