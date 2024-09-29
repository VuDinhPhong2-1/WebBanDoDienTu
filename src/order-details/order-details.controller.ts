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
import { OrderDetailsService } from './order-details.service';
import { CreateOrderDetailsDto } from './dto/create-order-details.dto';
import { UpdateOrderDetailsDto } from './dto/update-order-details.dto';
import { Roles, User } from '../decorators/customize';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Users } from '../entities/Users';
@Controller('order-details')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Post()
  create(
    @Body() createOrderDetailsDto: CreateOrderDetailsDto,
    @User() user: Users,
  ) {
    return this.orderDetailsService.create(
      createOrderDetailsDto,
      user.username,
    );
  }

  @Get()
  findAll() {
    return this.orderDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDetailsDto: UpdateOrderDetailsDto,
    @User() user: Users,
  ) {
    return this.orderDetailsService.update(
      +id,
      updateOrderDetailsDto,
      user.username,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderDetailsService.remove(+id);
  }
}
