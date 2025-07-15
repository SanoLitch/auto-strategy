import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { TokenModuleConfig } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService<TokenModuleConfig>) {
    super({
      jwtFromRequest: req => req?.cookies?.accessToken,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET', { infer: true }),
    });
  }

  public async validate(payload: any): Promise<any> {
    return payload;
  }
}
