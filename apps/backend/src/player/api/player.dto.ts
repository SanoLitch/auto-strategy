import {
  IsUUID, IsObject, IsOptional, IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlayerDto {
  @ApiProperty({
    description: 'Player\'s unique identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  public id: string;

  @ApiProperty({
    description: 'ID of the user associated with this player',
    example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
  })
  @IsUUID()
  public userId: string;

  @ApiProperty({
    description: 'ID of the game session this player belongs to',
    example: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
  })
  @IsUUID()
  public gameSessionId: string;

  @ApiProperty({
    description: 'A record of player resources',
    example: {
      gold: 1000,
      crystals: 50,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @IsObject()
  public resources: Record<string, number>;

  @ApiProperty({
    description: 'Indicates if the player is the winner',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  public isWinner?: boolean;
}
