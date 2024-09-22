import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';

export class SignupUserDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @Length(3, 100, { message: 'Username must be between 3 and 100 characters' })
  username: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 255, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Phone must be a string' })
  @IsOptional() // Nếu số điện thoại không bắt buộc, dùng @IsOptional
  @Matches(/^[0-9]{10,15}$/, {
    message: 'Phone number must be between 10 and 15 digits',
  })
  phone?: string; // '?' biểu thị đây là trường không bắt buộc
}
