import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt, Max, Min,
} from 'class-validator';

export class CreateGameSessionDto {
  @ApiProperty({
    description: 'Number of players in the game session',
    minimum: 2,
    maximum: 8,
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(8)
  public playersCount: number;

  @ApiProperty({
    description: 'Size of the map for the game session',
    minimum: 100,
    maximum: 1000,
    example: 200,
  })
  @Type(() => Number)
  @IsInt()
  @Min(100)
  @Max(1000)
  public mapSize: number;
}
