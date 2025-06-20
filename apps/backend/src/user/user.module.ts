import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TokenModule } from '@libs/nest-jwt';
import { UserController } from './api/user.controller';
import { UserService } from './domain/user.service';
import { UserRepository } from './db/user.repository';
import { DbModule } from '../core/db';

@Module({
  imports: [
    DbModule,
    ConfigModule,
    TokenModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
})
export class UserModule { }
