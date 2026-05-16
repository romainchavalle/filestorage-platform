import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      //                                                   ^ assertion "non-null"
      //    ConfigService.get() retourne string | undefined
      //    Le "!" dit à TypeScript "je garantis que cette valeur existe"
    });
  }

  validate(payload: { sub: string }) {
    return { userId: payload.sub };
  }
}
