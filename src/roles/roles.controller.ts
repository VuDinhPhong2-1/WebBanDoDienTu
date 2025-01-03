import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles, User } from '../decorators/customize';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Users } from '../entities/Users';

@Controller('roles')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @User() user: Users) {
    return this.rolesService.create(createRoleDto, user);
  }

  @Get()
  async findAllRoles(
    @Query('page') page?: string, // Nhận tham số `page` từ query
    @Query('roleName') roleName?: string, // Nhận tham số `roleName` từ query
  ) {
    const numericPage = Number(page) || 1; // Ép kiểu `page` thành số
    return this.rolesService.findAll(numericPage, roleName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(+id);
  }
}
