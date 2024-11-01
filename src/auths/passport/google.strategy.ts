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
      scope: ['email', 'profile'],
      passReqToCallback: true, // Thêm dòng này
    });
  }

  async validate(
    req: Request, // Thêm đối số Request
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ) {
    const response = req.res; // Lấy đối tượng Response từ Request
    const user = await this.authsService.validateGoogleOAuthUser(
      {
        email: profile.emails[0].value,
        displayName: profile.displayName,
        profilePicture: profile.photos[0].value,
      },
      response, // Truyền Response vào service
    );
    return user || null;
  }
}
