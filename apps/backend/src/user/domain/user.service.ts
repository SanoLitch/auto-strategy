import {
  Injectable, UnauthorizedException, ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

import { UserRepository } from '../db/user.repository';
import { RegisterDto } from '../api/register.dto';
import { LoginDto } from '../api/login.dto';
import { UserMapper } from '../lib/user.mapper';
import { UserDto } from '../api/user.dto';
import { User } from './user.entity';

/**
 * Сервис для регистрации, авторизации и аутентификации пользователя.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
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
  public async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const userPrisma = await this.userRepository.findByEmail(dto.email);
      const userEntity = UserMapper.toEntity(userPrisma);
      const isPasswordMatching = await userEntity.isPasswordMatching(dto.password);

      if (!isPasswordMatching) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: userEntity.email, sub: userEntity.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        accessToken,
        refreshToken,
        expiresIn: 3600, // as in documentation
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
}
