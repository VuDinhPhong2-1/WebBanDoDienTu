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

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

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
    if (!refresh_token) {
      throw new BadRequestException('No refresh token found');
    }
    return this.authsService.processNewToken(refresh_token, response);
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
      return { message: 'Logged out successfully' };
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
    return 'This is the admin dashboard';
  }
}
