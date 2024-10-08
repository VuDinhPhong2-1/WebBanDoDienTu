import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Users } from '../entities/Users';
import { Role } from '../enums/role.enum';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrderOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private orderService: OrdersService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: Users = request.user;
    const orderId = parseInt(request.params.orderId, 10);
    const userRoles = await this.usersService.getUserRoles(user.userId);
    if (isNaN(orderId)) {
      throw new NotFoundException('Order ID không hợp lệ');
    }

    if (userRoles.some((role) => role.roleName === Role.ADMIN)) {
      return true;
    }

    const order = await this.orderService.findOne(orderId);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng với ID ${orderId}`);
    }

    if (order.userId !== user.userId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào đơn hàng này',
      );
    }

    return true;
  }
}
