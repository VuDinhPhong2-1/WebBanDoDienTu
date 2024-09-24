import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brands } from '../entities/Brands';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Users } from '../entities/Users';
import { Roles, User } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('brands')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard) 
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findAll(): Promise<Brands[]> {
    return this.brandsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Brands> {
    return this.brandsService.findOne(id);
  }

  @Post()
  create(
    @Body() createBrandDto: CreateBrandDto,
    @User() user: Users,
  ): Promise<Brands> {
    return this.brandsService.create(createBrandDto, user);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() updateBrandDto: UpdateBrandDto,
    @User() user: Users,
  ): Promise<Brands> {
    return this.brandsService.update(id, updateBrandDto, user);
  }

  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.brandsService.delete(id);
  }
}
