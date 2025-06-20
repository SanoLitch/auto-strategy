import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenModuleConfig } from './types';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TokenModuleConfig>) => ({
        secret: configService.getOrThrow('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: configService.getOrThrow('ACCESS_TOKEN_EXPIRES_IN', { infer: true }) },
      }),
    }),
  ],
  providers: [
    JwtService,
    JwtStrategy,
    TokenService,
  ],
  exports: [TokenService, JwtAuthGuard],
})
export class TokenModule {}