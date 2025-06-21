import {
  Body, Controller, Get, Logger, Post, Req, UseGuards, Res,
} from '@nestjs/common';
import {
  Request, Response,
} from 'express';
import {
  ApiBody, ApiOperation, ApiResponse, ApiTags, ApiCookieAuth,
} from '@nestjs/swagger';
import {
  JwtAuthGuard, UserId,
} from '@libs/nest-jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';
import { UserDto } from './user.dto';
import { UserService } from '../domain/user.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('User')
@Controller('v1/users')
export class UserController {
  private readonly logger: Logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Invalid input data.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. User with this email already exists.',
  })
  public async register(@Body() dto: RegisterDto): Promise<UserDto> {
    this.logger.log(`POST /v1/users - register: ${ dto.email }`);

    return this.userService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in a user and set httpOnly cookies' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in. Access and refresh tokens are set as httpOnly cookies.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  public async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.logger.log(`POST /v1/users/login - login: ${ dto.email }`);

    const {
      access,
      refresh,
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
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile.',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  public async me(@UserId() userId: string): Promise<UserDto> {
    this.logger.log(`GET /v1/users/me - user: ${ userId }`);

    return this.userService.getMe(userId);
  }
}
