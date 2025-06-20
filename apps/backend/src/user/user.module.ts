import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from '@libs/nest-jwt-guard';

import { DbModule, DbService } from 'src/db';
import { UserController } from './api/user.controller';
import { UserService } from './domain/user.service';
import { UserRepository } from './db/user.repository';
import { JwtStrategy } from './lib/jwt.strategy';

/**
 * Модуль пользователя.
 */
@Module({
  imports: [
    DbModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository, JwtStrategy, JwtAuthGuard],
  exports: [UserService, UserRepository],
})
export class UserModule { }
