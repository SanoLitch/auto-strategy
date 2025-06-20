import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenModuleConfig, TokenWithExpiry } from './types';


@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TokenModuleConfig>,
  ) {}

  /**
   * Генерирует accessToken и возвращает его с временем жизни (мс).
   */
  public generateAccessToken(payload: object): TokenWithExpiry {
    const expiresInStr = this.configService.getOrThrow('ACCESS_TOKEN_EXPIRES_IN', { infer: true });
    const expiresIn = this.parseExpiresInToMs(expiresInStr);
    const token = this.jwtService.sign(payload);
    return { token, expiresIn };
  }

  /**
   * Генерирует refreshToken и возвращает его с временем жизни (мс).
   */
  public generateRefreshToken(payload: object): TokenWithExpiry {
    const expiresInStr = this.configService.getOrThrow('REFRESH_TOKEN_EXPIRES_IN', { infer: true });
    const expiresIn = this.parseExpiresInToMs(expiresInStr);
    const token = this.jwtService.sign(payload, { expiresIn: expiresInStr });
    return { token, expiresIn };
  }

  /**
   * Преобразует строку времени жизни токена в миллисекунды.
   */
  private parseExpiresInToMs(expiresIn: string): number {
    // Поддержка форматов: '3600', '1h', '7d', '30m', '10s'
    const match = expiresIn.match(/^(\d+)([smhd]?)$/);
    if (!match) return Number(expiresIn) * 1000 || 3600 * 1000;
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 3600 * 1000;
      case 'd': return value * 86400 * 1000;
      default: return value * 1000;
    }
  }
}