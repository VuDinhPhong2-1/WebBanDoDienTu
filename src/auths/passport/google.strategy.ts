import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import * as dotenv from 'dotenv';
import { AuthsService } from '../auths.service';
import { Request } from 'express';

dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authsService: AuthsService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      scope: ['profile', 'email'],
      passReqToCallback: true,
      prompt: 'select_account',
    });
  }

  authorizationParams(option: any) {
    return Object.assign(option, {
      prompt: 'select_account',
    });
  }
  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const response = req.res;
    const user = await this.authsService.validateGoogleOAuthUser(
      {
        email: profile.emails[0].value,
        displayName: profile.displayName,
        profilePicture: profile.photos[0].value,
      },
      response,
    );
    return user || null;
  }
}
