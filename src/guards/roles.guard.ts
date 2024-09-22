import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { ROLES_KEY } from '../decorators/customize';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService, // Inject service to fetch user information from DB
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieve the required roles from metadata (ROLES_KEY) attached to controller/method
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [
        context.getHandler(), // The method handler
        context.getClass(),
      ],
    );

    // If the route does not require specific roles, allow access
    if (!requiredRoles) {
      return true;
    }

    // Get the request from context
    const request = context.switchToHttp().getRequest();
    const user = request.user; // User information assigned via JWT Auth
    // Fetch the roles of the user from the database
    const userRoles = await this.usersService.getUserRoles(user.userId);
    // Check if the user has the required role(s)
    const hasRole = userRoles.some((role) =>
      requiredRoles.includes(role.roleName),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have permission to access this resource.',
      );
    }

    return hasRole;
  }
}
