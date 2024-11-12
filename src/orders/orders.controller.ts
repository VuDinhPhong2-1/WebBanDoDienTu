import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles, User } from '../decorators/customize';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Users } from '../entities/Users';
import { OrderOwnerGuard } from '../guards/order-owner.guard';
import { PaymentMethodsService } from '../payment-methods/payment-methods.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}


  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('latest')
  async findLatestOrders() {
    return this.ordersService.findLatestOrders();
  }

  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @User() user: Users) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.ordersService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get('user-orders')
  findAllByUser(@Request() req) {
    const userId = req.user.userId;
    return this.ordersService.findAllByUser(userId);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: Users,
  ) {
    return this.ordersService.update(+id, updateOrderDto, user);
  }

  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Roles(Role.CUSTOMER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard, OrderOwnerGuard)
  @Get('details/:orderId')
  async findOneWithDetails(@Param('orderId') orderId: number) {
    return this.ordersService.findOneWithDetails(orderId);
  }
}
