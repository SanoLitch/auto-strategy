import {
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * DTO для авторизации пользователя.
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}