import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShippingMethodsService } from './shipping-methods.service';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { Roles, User } from '../decorators/customize';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Users } from '../entities/Users';

@Controller('shipping-methods')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShippingMethodsController {
  constructor(
    private readonly shippingMethodsService: ShippingMethodsService,
  ) {}

  @Post()
  create(
    @Body() createShippingMethodDto: CreateShippingMethodDto,
    @User() user: Users,
  ) {
    return this.shippingMethodsService.create(
      createShippingMethodDto,
      user.username,
    );
  }

  @Get()
  findAll() {
    return this.shippingMethodsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shippingMethodsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShippingMethodDto: UpdateShippingMethodDto,
    @User() user: Users,
  ) {
    return this.shippingMethodsService.update(
      +id,
      updateShippingMethodDto,
      user.username,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shippingMethodsService.remove(+id);
  }
}
