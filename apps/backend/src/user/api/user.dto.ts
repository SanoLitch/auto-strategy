import {
  IsEmail, IsString, IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'Unique user identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  public id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'test@example.com',
  })
  @IsEmail()
  public email: string;

  @ApiProperty({
    description: 'When the user was created',
    example: '2023-10-27T10:00:00.000Z',
  })
  @IsString()
  public createdAt: string;

  @ApiProperty({
    description: 'When the user was last updated',
    example: '2023-10-27T10:00:00.000Z',
  })
  @IsString()
  public updatedAt: string;
}
