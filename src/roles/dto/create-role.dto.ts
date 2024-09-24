import { IsString, IsOptional, Length, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(3, 100)
  roleName: string;

  @IsString()
  @IsOptional()
  @Length(3, 255)
  description?: string;
}
