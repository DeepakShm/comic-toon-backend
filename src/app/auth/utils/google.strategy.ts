import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserService } from 'src/app/user/user.service';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private readonly userService: UserService) {
    super({
      clientID: config.get<string>('CLIENT_ID'),
      clientSecret: config.get('CLIENT_SECRET'),
      callbackURL: config.get('GOOGLE_AUTH_REDIRECT_URI'),
      scope: ['profile', 'email'],
    });
  }

  // after successfull authentication of user, this function is invoked
  // So we can here do some database calls, to store the details or validate user.
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);

    let user = await this.userService.userExistsUsingEmail(profile._json.email, profile.provider);
    if (!user) {
      user = await this.userService.createUser({
        username: profile._json.name,
        email: profile._json.email,
        provider: profile.provider,
        picture: profile._json.picture,
      });
    }
    return user;
  }
}