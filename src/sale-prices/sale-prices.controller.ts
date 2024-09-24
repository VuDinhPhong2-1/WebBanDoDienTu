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
import { SalePricesService } from './sale-prices.service';
import { CreateSalePriceDto } from './dto/create-sale-price.dto';
import { Roles } from '../decorators/customize';
import { Role } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { UpdateSalePriceDto } from './dto/update-sale-price.dto';

@Controller('sale-prices')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalePricesController {
  constructor(private readonly salePricesService: SalePricesService) {}

  @Get()
  async findAll() {
    return this.salePricesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.salePricesService.findOne(id);
  }

  @Post()
  async create(@Body() createSalePriceDto: CreateSalePriceDto) {
    return this.salePricesService.create(createSalePriceDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateSalePriceDto: UpdateSalePriceDto,
  ) {
    return this.salePricesService.update(id, updateSalePriceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.salePricesService.remove(id);
  }
}
