import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID, IsEnum, IsDateString, IsOptional,
} from 'class-validator';
import { GameSessionStatus } from '../domain/game-session.entity';

export class GameSessionDto {
  @ApiProperty({
    description: 'Unique game session identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Identifier of the map for this session (UUID)',
    example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
    required: false,
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  mapId: string | null;

  @ApiProperty({
    description: 'Current status of the game session',
    enum: GameSessionStatus,
    example: GameSessionStatus.Waiting,
  })
  @IsEnum(GameSessionStatus)
  status: GameSessionStatus;

  @ApiProperty({
    description: 'When the game session was created',
    example: '2023-10-27T10:00:00.000Z',
  })
  @IsDateString()
  createdAt: string;

  @ApiProperty({
    description: 'When the game session was finished',
    example: '2023-10-27T11:00:00.000Z',
    required: false,
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  finishedAt: string | null;
}
