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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { Roles, User } from '../decorators/customize';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Users } from '../entities/Users';

@Controller('payment-methods')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
    @User() user: Users,
  ) {
    return this.paymentMethodsService.create(
      createPaymentMethodDto,
      user.userId,
    );
  }

  @Get()
  findAll() {
    return this.paymentMethodsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentMethodsService.findOneById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
    @User() user: Users,
  ) {
    return this.paymentMethodsService.update(
      +id,
      updatePaymentMethodDto,
      user.userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentMethodsService.remove(+id);
  }
}
