import {
  Controller, Post, Body, Get, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@libs/nest-jwt-guard';

import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { UserDto } from './user.dto';
import { UserService } from '../domain/user.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

/**
 * Контроллер для регистрации, авторизации и управления пользователями.
 */
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Регистрация нового пользователя.
   */
  @Post()
  public async register(@Body() dto: RegisterDto): Promise<UserDto> {
    return this.userService.register(dto);
  }

  /**
   * Авторизация пользователя.
   */
  @Post('login')
  public async login(@Body() dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    return this.userService.login(dto);
  }

  /**
   * Получение информации о текущем пользователе.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  public async me(@Req() req: RequestWithUser): Promise<UserDto> {
    // req.user будет содержать данные пользователя после прохождения JwtAuthGuard
    return this.userService.getMe(req.user);
  }
}
