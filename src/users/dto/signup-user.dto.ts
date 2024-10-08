import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

export class SignupUserDto {
  @IsString({ message: 'Tên người dùng phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên người dùng là bắt buộc' })
  @Length(3, 100, { message: 'Tên người dùng phải có từ 3 đến 100 ký tự' })
  username: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @Length(8, 255, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsOptional() // Nếu số điện thoại không bắt buộc, dùng @IsOptional
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Số điện thoại phải có từ 10 đến 15 chữ số',
  })
  phone?: string; // '?' biểu thị đây là trường không bắt buộc
}
