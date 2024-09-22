import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupUserDto } from './dto/signup-user.dto';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { Roles } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Signup user - roleId is fixed to 3 (Viewer) by default
  @Post('signup')
  signup(@Body() signupUserDto: SignupUserDto) {
    return this.usersService.signup(signupUserDto);
  }

  // Find all users
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query() filterDto: GetUsersFilterDto) {
    return this.usersService.findAll(filterDto);
  }

  // Find one user by ID, requires JwtAuthGuard
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  // Remove user by ID, only Admin can perform this action
  @Roles(Role.ADMIN) // Only allow Admin role
  @UseGuards(JwtAuthGuard, RolesGuard) // JWT Authentication and Roles Guard
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}