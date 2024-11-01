/* eslint-disable @typescript-eslint/ban-types */
import { Inject, Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthsService } from '../auths.service';
import { Users } from '../../entities/Users';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: Users, done: Function) {
    done(null, user);
  }

  async deserializeUser(payload: any, done: Function) {
    const user = await this.usersService.findOneById(payload.id);
    return user ? done(null, user) : done(null, null);
  }
}
