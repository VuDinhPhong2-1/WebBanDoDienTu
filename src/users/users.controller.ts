import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Put,
  ParseIntPipe,
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

  // Find all users
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all-users')
  async findAll(
    @Query('page') page?: string,
    @Query('userName') userName?: string,
  ) {
    const numericPage = Number(page) || 1;
    const users = await this.usersService.findAll(numericPage, userName);

    return {
      users,
    };
  }

  // Find one user by ID, requires JwtAuthGuard
  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Request() req) {
    const userId = req.user.userId;
    const user = await this.usersService.findOneById(userId);

    // Include the role in the response
    return {
      ...user,
      // role: user.role,
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':userId')
  AdminFindOne(@Param('userId') userId: number) {
    return this.usersService.findOneById(userId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':userId/roles')
  async updateUserRoles(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('roleIds') roleIds: number[],
    @Request() req,
  ) {
    const adminId = req.user.userId; // Get the admin's ID who is making the change
    return this.usersService.updateUserRoles(userId, roleIds, adminId);
  }

  // @Roles(Role.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Post(':userId/roles')
  // async assignRolesToUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Body('roleIds') roleIds: number[],
  //   @Request() req,
  // ) {
  //   const adminId = req.user.userId;
  //   return this.usersService.assignRolesToUser(userId, roleIds, adminId);
  // }

  // Remove user by ID, only Admin can perform this action
  @Roles(Role.ADMIN) // Only allow Admin role
  @UseGuards(JwtAuthGuard, RolesGuard) // JWT Authentication and Roles Guard
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}
