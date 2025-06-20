import {
  Injectable, UnauthorizedException, ConflictException, Logger,
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

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) { }

  public async register(dto: RegisterDto): Promise<UserDto> {
    this.logger.log(`Register user: ${ dto.email }`);
    try {
      await this.userRepository.findByEmail(dto.email);
      throw new ConflictException('Email already exists');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Ожидаемое поведение: пользователь не найден, продолжаем.
      } else {
        this.logger.error(`Error during registration: ${ error }`);
        throw error;
      }
    }

    const newUser = await User.create({
      email: dto.email,
      password: dto.password,
    });

    const persistenceData = UserMapper.toPersistence(newUser);

    await this.userRepository.create(persistenceData);

    this.logger.log(`User registered: ${ dto.email }`);
    return UserMapper.toDto(newUser);
  }

  public async login(dto: LoginDto): Promise<{ access: TokenWithExpiry; refresh: TokenWithExpiry }> {
    this.logger.log(`Login attempt: ${ dto.email }`);

    try {
      const userPrisma = await this.userRepository.findByEmail(dto.email);
      const userEntity = UserMapper.toEntity(userPrisma);
      const isPasswordMatching = await userEntity.isPasswordMatching(dto.password);

      if (!isPasswordMatching) {
        this.logger.warn(`Invalid credentials for: ${ dto.email }`);

        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        email: userEntity.email,
        sub: userEntity.id,
      };
      const access = this.tokenService.generateAccessToken(payload);
      const refresh = this.tokenService.generateRefreshToken(payload);

      this.logger.log(`Login success: ${ dto.email }`);

      return {
        access,
        refresh,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`User not found for login: ${ dto.email }`);

        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.error(`Login error for ${ dto.email }: ${ error }`);

      throw error;
    }
  }

  public async getMe(userFromJwt: { sub: string }): Promise<UserDto> {
    this.logger.log(`Get current user: ${ userFromJwt.sub }`);

    try {
      const userPrisma = await this.userRepository.findById(userFromJwt.sub);
      const userEntity = UserMapper.toEntity(userPrisma);

      return UserMapper.toDto(userEntity);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        this.logger.warn(`User from JWT not found: ${ userFromJwt.sub }`);

        throw new UnauthorizedException();
      }
      this.logger.error(`Error in getMe: ${ error }`);

      throw error;
    }
  }
}
