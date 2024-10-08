import { IsString, IsOptional, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Tên vai trò phải là một chuỗi ký tự.' })
  @Length(3, 100, { message: 'Tên vai trò phải có độ dài từ 3 đến 100 ký tự.' })
  roleName: string;

  @IsString({ message: 'Mô tả phải là một chuỗi ký tự.' })
  @IsOptional()
  @Length(3, 255, { message: 'Mô tả phải có độ dài từ 3 đến 255 ký tự.' })
  description?: string;
}
