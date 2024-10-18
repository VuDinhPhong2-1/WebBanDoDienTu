import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { Users } from '../entities/Users';

@Injectable()
export class AuthsService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  // Hàm tạo payload chung
  createTokenPayload(user: Users) {
    const { userId, fullName, email } = user;
    return {
      sub: 'token login',
      iss: 'from server',
      userId,
      fullName,
      email,
    };
  }

  // Hàm tạo refresh token
  createRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
  }

  // Hàm thiết lập cookie refresh token
  setRefreshTokenCookie(response: Response, refresh_token: string) {
    return response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });
  }

  // Hàm xóa refresh token cookie
  clearRefreshTokenCookie(response: Response) {
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
    });
  }

  // Xác thực người dùng
  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }
    const isValidPassword = await this.usersService.isValidPassword(
      password,
      user.passwordHash,
    );
    if (isValidPassword) {
      const { passwordHash, ...result } = user;
      return result;
    } else {
      throw new BadRequestException('Mật khẩu không đúng.');
    }
  }

  // Đăng nhập và tạo các token
  async login(user: Users, response: Response) {
    const payload = this.createTokenPayload(user);

    this.clearRefreshTokenCookie(response);

    const refresh_token = this.createRefreshToken(payload);
    this.setRefreshTokenCookie(response, refresh_token);

    await this.usersService.updateUserRefreshToken(refresh_token, user.userId);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
    };
  }

  // Xử lý khi cần token mới từ refresh token
  async processNewToken(refresh_token: string, response: Response) {
    try {
      this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.usersService.findOneByRefreshToken(refresh_token);
      if (user) {
        const payload = this.createTokenPayload(user);

        this.clearRefreshTokenCookie(response);

        const new_refresh_token = this.createRefreshToken(payload);
        this.setRefreshTokenCookie(response, new_refresh_token);
        await this.usersService.updateUserRefreshToken(
          new_refresh_token,
          user.userId,
        );

        return {
          access_token: this.jwtService.sign(payload),
          refresh_token: new_refresh_token,
        };
      } else {
        throw new BadRequestException(
          'Token không hợp lệ! Vui lòng đăng nhập lại.',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        'Token không hợp lệ! Vui lòng đăng nhập lại.',
      );
    }
  }

  // Xóa refresh token và cookie
  async deleteCookieAndToken(userId: number) {
    try {
      await this.usersService.updateUserRefreshToken(null, userId);
      return true;
    } catch (error) {
      throw new BadRequestException('Không thể xóa token và cookie.');
    }
  }

  // Giải mã token
  async decodeToken(token: string) {
    try {
      const decoded = this.jwtService.decode(token);
      return decoded;
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ.');
    }
  }

  // Xác thực token truy cập
  async validateAccessToken(token: string): Promise<boolean> {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Xác thực refresh token
  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
