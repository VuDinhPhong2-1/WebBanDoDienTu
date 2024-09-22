import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Roles } from '../entities/Roles';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../guards/roles.guard';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([Roles]), forwardRef(() => UsersModule)],
  controllers: [RolesController],
  providers: [RolesService, RolesGuard],
  exports: [RolesService],
})
export class RolesModule {}
