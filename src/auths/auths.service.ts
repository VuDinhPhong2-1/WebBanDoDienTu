import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { Users } from '../entities/Users';
import { Role } from '../enums/role.enum';
import { RolesService } from '../roles/roles.service';
import { UserRolesService } from '../user-roles/user-roles.service';

@Injectable()
export class AuthsService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private rolesService: RolesService,
    private userRolesService: UserRolesService,
  ) {}

  // Hàm tạo payload chung
  createTokenPayload(user: Users, roles?: string[]) {
    const { userId, fullName, email } = user;
    return {
      sub: 'token login',
      iss: 'from server',
      userId,
      fullName,
      email,
      roles: roles || [],
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
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email); // Tìm người dùng bằng email
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

  async login(user: Users, response: Response) {
    const payload = this.createTokenPayload(user);

    const roles = await this.usersService.getUserRoles(user.userId);

    payload.roles = roles.map((role) => role.roleName);

    this.clearRefreshTokenCookie(response);

    const refresh_token = this.createRefreshToken(payload);
    this.setRefreshTokenCookie(response, refresh_token);

    await this.usersService.updateUserRefreshToken(refresh_token, user.userId);

    const {
      passwordHash,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      ...userInfo
    } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userInfo,
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

  async validateGoogleOAuthUser(userDetail: any, response: Response) {
    // Tìm người dùng theo email
    let user = await this.usersService.findOneByEmail(userDetail.email);
    if (user) {
      if (user.profilePicture !== userDetail.profilePicture) {
        user.profilePicture = userDetail.profilePicture;
        user = await this.usersService.saveGoogleUser(user);

        // Tải lại user từ cơ sở dữ liệu để đảm bảo profilePicture đã được cập nhật
        user = await this.usersService.findOneByEmail(user.email);
      }
    } else {
      // Nếu người dùng chưa tồn tại, tạo mới
      user = await this.usersService.createGoogleUser({
        email: userDetail.email,
        fullName: userDetail.displayName,
        profilePicture: userDetail.profilePicture,
        isActive: true,
      });

      const defaultRole = Role.CUSTOMER;
      const role = await this.rolesService.findByRoleName(defaultRole);
      await this.userRolesService.assignRoleToUser(user.userId, role.roleId);

      // Tải lại user từ cơ sở dữ liệu để đảm bảo profilePicture đã được lưu đúng cách
      user = await this.usersService.findOneByEmail(user.email);
    }
    // Tạo payload cho JWT
    const payload = {
      userId: user.userId,
      email: user.email,
      roles: (await this.usersService.getUserRoles(user.userId)).map(
        (role) => role.roleName,
      ),
    };

    // Tạo access token
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.createRefreshToken(payload);
    this.setRefreshTokenCookie(response, refresh_token);

    // Xóa thông tin không cần thiết trước khi trả về
    const {
      passwordHash,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      ...userInfo
    } = user;
    return {
      access_token,
      user: userInfo,
    };
  }
}
