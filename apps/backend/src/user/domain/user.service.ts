import {
  Injectable, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  TokenService, type TokenWithExpiry,
} from '@libs/nest-jwt';
import { User } from './user.entity';
import { UserRepository } from '../db/user.repository';
import { RegisterDto } from '../api/register.dto';
import { LoginDto } from '../api/login.dto';
import { UserMapper } from '../lib/user.mapper';
import { UserDto } from '../api/user.dto';

/**
 * Сервис для регистрации, авторизации и аутентификации пользователя.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) { }

  /**
   * Регистрация нового пользователя.
   */
  public async register(dto: RegisterDto): Promise<UserDto> {
    try {
      await this.userRepository.findByEmail(dto.email);
      throw new ConflictException('Email already exists');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Ожидаемое поведение: пользователь не найден, продолжаем.
      } else {
        throw error;
      }
    }

    const newUser = await User.create({
      email: dto.email,
      password: dto.password,
    });

    const persistenceData = UserMapper.toPersistence(newUser);

    await this.userRepository.create(persistenceData);

    return UserMapper.toDto(newUser);
  }

  /**
   * Авторизация пользователя.
   */
  public async login(dto: LoginDto): Promise<{ access: TokenWithExpiry; refresh: TokenWithExpiry }> {
    try {
      const userPrisma = await this.userRepository.findByEmail(dto.email);
      const userEntity = UserMapper.toEntity(userPrisma);
      const isPasswordMatching = await userEntity.isPasswordMatching(dto.password);

      if (!isPasswordMatching) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        email: userEntity.email,
        sub: userEntity.id,
      };
      const access = this.tokenService.generateAccessToken(payload);
      const refresh = this.tokenService.generateRefreshToken(payload);

      return {
        access,
        refresh,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  /**
   * Получение информации о текущем пользователе.
   */
  public async getMe(userFromJwt: { sub: string }): Promise<UserDto> {
    try {
      const userPrisma = await this.userRepository.findById(userFromJwt.sub);
      const userEntity = UserMapper.toEntity(userPrisma);

      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Пользователь из JWT не найден в базе данных
        throw new UnauthorizedException();
      }
      throw error;
    }
  }

  /**
   * Преобразует строку времени жизни токена в секунды.
   */
  private parseExpiresInToSeconds(expiresIn: string): number {
    // Поддержка форматов: '3600', '1h', '7d', '30m', '10s'
    const match = expiresIn.match(/^(\d+)([smhd]?)$/);

    if (!match) return Number(expiresIn) || 3600;
    const value = Number(match[1]);
    const unit = match[2];

    switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return value;
    }
  }
}
