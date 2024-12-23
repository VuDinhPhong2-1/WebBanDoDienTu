import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthsService } from './auths.service';

import { Request, Response } from 'express';
import { Roles, User } from '../decorators/customize';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { Users } from '../entities/Users';
import { SignupUserDto } from '../users/dto/signup-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auths')
export class AuthsController {
  constructor(
    private readonly authsService: AuthsService,
    private readonly usersService: UsersService,
  ) {}

  // Login API
  @UseGuards(LocalAuthGuard)
  @Post('signIn')
  async login(@Res({ passthrough: true }) response: Response, @User() user) {
    return this.authsService.login(user, response);
  }

  // Refresh Token API
  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    console.log('refresh_token', refresh_token);
    if (!refresh_token) {
      throw new BadRequestException('No refresh token found');
    }

    const test = await this.authsService.processNewToken(
      refresh_token,
      response,
    );
    console.log(test);

    return test;
  }

  // Logout API
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refresh_token = request.cookies['refresh_token'];
    if (!refresh_token) {
      throw new BadRequestException('No refresh token found');
    }

    const decoded = await this.authsService.decodeToken(refresh_token);
    if (typeof decoded === 'object' && decoded.hasOwnProperty('userId')) {
      await this.authsService.deleteCookieAndToken(decoded['userId']);
      this.authsService.clearRefreshTokenCookie(response);

      // Xóa cookies liên quan đến phiên đăng nhập
      response.clearCookie('access_token');
      response.clearCookie('user');

      // Đảm bảo rằng phiên đăng nhập cũng bị xóa khỏi passport
      request.logout((err) => {
        if (err) {
          console.error('Logout error: ', err);
          throw new BadRequestException('Logout failed');
        }
      });

      return {
        message: 'Logged out successfully',
        logoutUrl:
          'https://accounts.google.com/Logout?continue=https://your-app.com', // Thêm URL để quay lại app của bạn
      };
    } else {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  // Validate Access Token API
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Req() request: Request) {
    // If token is valid, request.user will be populated by JwtAuthGuard
    return {
      message: 'You have access to this protected route',
      user: request['user'],
    };
  }

  // Decode Token API
  @Get('decode-token/:token')
  async decodeToken(@Param('token') token: string) {
    const decoded = await this.authsService.decodeToken(token);
    return { decoded };
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin-dashboard')
  getAdminDashboard() {
    return true;
  }

  // GOOGLE OAUTH2

  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async handleLogin(@Req() req: Request, @Res() res: Response) {}

  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async handleRedirect(@Req() req: Request, @Res() res: Response) {
    const { access_token, user } =
      await this.authsService.validateGoogleOAuthUser(req.user, res);

    res.cookie('access_token', access_token);
    res.cookie('user', JSON.stringify(user));
    res.redirect('http://localhost:3000/');
  }

  // Signup user - roleId is fixed to 3 (Viewer) by default
  @Post('signup')
  signup(@Body() signupUserDto: SignupUserDto) {
    return this.usersService.signup(signupUserDto);
  }
}
