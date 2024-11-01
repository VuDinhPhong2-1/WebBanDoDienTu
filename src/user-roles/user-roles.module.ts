import { Module, forwardRef } from '@nestjs/common';
import { UserRolesService } from './user-roles.service';
import { UserRolesController } from './user-roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoles } from '../entities/UserRoles';
import { Users } from '../entities/Users';
import { Roles } from '../entities/Roles';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRoles, Users, Roles]),
    forwardRef(() => UsersModule),
  ],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
