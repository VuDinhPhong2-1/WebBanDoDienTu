import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Roles, User } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Users } from '../entities/Users';

@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  async findAll() {
    return this.discountsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.discountsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDiscountDto: CreateDiscountDto,
    @User() user: Users,
  ) {
    return this.discountsService.create(createDiscountDto, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDiscountDto: UpdateDiscountDto,
    @User() user: Users,
  ) {
    return this.discountsService.update(id, updateDiscountDto, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.discountsService.remove(id);
  }
}
