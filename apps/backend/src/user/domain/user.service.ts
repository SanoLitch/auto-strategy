import {
  Injectable, UnauthorizedException, ConflictException, Logger, NotFoundException,
} from '@nestjs/common';
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

    const userExists = await this.userRepository.existsByEmail(dto.email);

    if (userExists) {
      throw new ConflictException('Email already exists');
    }

    const newUser = await User.create({
      email: dto.email,
      password: dto.password,
    });

    await this.userRepository.create(UserMapper.toPersistence(newUser));

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
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        email: userEntity.email,
        sub: userEntity.id.getValue(),
      };
      const access = this.tokenService.generateAccessToken(payload);
      const refresh = this.tokenService.generateRefreshToken(payload);

      this.logger.log(`Login success: ${ dto.email }`);

      return {
        access,
        refresh,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`Login attempt for non-existent user: ${ dto.email }`);
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

      return UserMapper.toDto(UserMapper.toEntity(userPrisma));
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(`User from JWT not found: ${ userFromJwt.sub }`);
        throw new UnauthorizedException('User not found');
      }
      this.logger.error(`Error in getMe: ${ error }`);
      throw error;
    }
  }
}
