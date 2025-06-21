import {
  IsObject, IsNumber, IsPositive, Min, Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreateMapSizeDto {
  @ApiProperty({
    description: 'Width of the map',
    example: 100,
    minimum: 10,
    maximum: 1000,
  })
  @IsNumber()
  @IsPositive()
  @Min(10)
  @Max(1000)
  public width: number;

  @ApiProperty({
    description: 'Height of the map',
    example: 100,
    minimum: 10,
    maximum: 1000,
  })
  @IsNumber()
  @IsPositive()
  @Min(10)
  @Max(1000)
  public height: number;
}

export class CreateMapDto {
  @ApiProperty({
    description: 'Map dimensions',
    type: CreateMapSizeDto,
  })
  @IsObject()
  public size: CreateMapSizeDto;

  @ApiProperty({
    description: 'Number of players for this map',
    example: 2,
    minimum: 1,
    maximum: 8,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(8)
  public playersCount: number;
}
