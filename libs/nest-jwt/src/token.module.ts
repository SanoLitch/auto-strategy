import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenModuleConfig } from './types';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TokenModuleConfig>) => ({
        secret: configService.getOrThrow('JWT_SECRET', { infer: true }),
        signOptions: { expiresIn: configService.getOrThrow('ACCESS_TOKEN_EXPIRES_IN', { infer: true }) },
      }),
    }),
  ],
  providers: [
    JwtAuthGuard,
    JwtStrategy,
    TokenService,
  ],
  exports: [TokenService, JwtAuthGuard],
})
export class TokenModule {}
