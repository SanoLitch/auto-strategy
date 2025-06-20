import {
  Controller, Post, Body, Get, Req, UseGuards, Res,
} from '@nestjs/common';
import {
  Request, Response,
} from 'express';
import { JwtAuthGuard } from '@libs/nest-jwt';
import { Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { UserDto } from './user.dto';
import { UserService } from '../domain/user.service';
import { AppConfig } from '../../config/env.validation';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@Controller('api/v1/users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService<AppConfig>,
  ) { }

  @Post()
  public async register(@Body() dto: RegisterDto): Promise<UserDto> {
    this.logger.log(`POST /api/v1/users - register: ${ dto.email }`);

    return this.userService.register(dto);
  }

  @Post('login')
  public async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`POST /api/v1/users/login - login: ${ dto.email }`);

    const {
      access, refresh,
    } = await this.userService.login(dto);

    const isProd = this.configService.get('NODE_ENV', 'development') === 'production';

    res.cookie('accessToken', access.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: access.expiresIn * 1000,
    });

    res.cookie('refreshToken', refresh.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: refresh.expiresIn * 1000,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public async me(@Req() req: RequestWithUser): Promise<UserDto> {
    this.logger.log(`GET /api/v1/users/me - user: ${ req.user.sub }`);

    return this.userService.getMe(req.user);
  }
}
