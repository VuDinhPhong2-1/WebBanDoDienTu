import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { Roles, User } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Users } from '../entities/Users';

@Controller('user-roles')
@UseGuards(JwtAuthGuard, RolesGuard) // Use JWT and Roles Guard for all routes
@Roles(Role.ADMIN) // Only Admins can access these APIs
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post('assign')
  async assignRoleToUser(
    @Body() assignRoleDto: { userId: number; roleId: number },
    @User() user: Users,
  ) {
    return this.userRolesService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
      user.userId,
    );
  }

  @Delete('remove')
  async removeRoleFromUser(
    @Body() removeRoleDto: { userId: number; roleId: number },
  ) {
    return this.userRolesService.removeRoleFromUser(
      removeRoleDto.userId,
      removeRoleDto.roleId,
    );
  }

  @Get(':userId')
  async getUserRoles(@Param('userId') userId: number) {
    return this.userRolesService.getUserRoles(userId);
  }
}
