import { Module, forwardRef } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ms from 'ms';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { GoogleStrategy } from './passport/google.strategy';
import { SessionSerializer } from './passport/Serializer';
import { UserRolesModule } from '../user-roles/user-roles.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    UserRolesModule,
    RolesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: ms(configService.get<string>('JWT_ACCESS_EXPIRE')) / 1000,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthsController],
  providers: [
    AuthsService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    SessionSerializer,
  ],
})
export class AuthsModule {}
