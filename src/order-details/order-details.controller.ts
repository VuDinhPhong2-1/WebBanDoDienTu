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
import { OrderOwnerGuard } from '../guards/order-owner.guard';

@Controller('order-details')
@Roles(Role.ADMIN, Role.CUSTOMER)
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  // @Post()
  // create(
  //   @Body() createOrderDetailsDto: CreateOrderDetailsDto,
  //   @User() user: Users,
  // ) {
  //   return this.orderDetailsService.create(
  //     createOrderDetailsDto,
  //     user.username,
  //   );
  // }

  // @Get('all-details')
  // findAll() {
  //   return this.orderDetailsService.findAll();
  // }

  @UseGuards(OrderOwnerGuard)
  @Get(':orderId')
  findOne(@Param('orderId') id: number) {
    return this.orderDetailsService.findAllByOrderId(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateOrderDetailsDto: UpdateOrderDetailsDto,
  //   @User() user: Users,
  // ) {
  //   return this.orderDetailsService.update(
  //     +id,
  //     updateOrderDetailsDto,
  //     user.username,
  //   );
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderDetailsService.remove(+id);
  }

  // @UseGuards(OrderOwnerGuard)
  // @Get('order/:orderId/products')
  // async getProductsByOrderId(@Param('orderId') orderId: number) {
  //   return this.orderDetailsService.getProductsByOrderId(orderId);
  // }
}
