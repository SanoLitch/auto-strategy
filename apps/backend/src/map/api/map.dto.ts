import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID, IsObject, IsArray, IsEnum, ValidateNested, IsNotEmpty,
} from 'class-validator';
import { TerrainType } from '../domain/map.entity';
import {Type} from "class-transformer";

// Тут общая рекомендация по структуре описания dto, каждый класс dto описывать в своем файле, так удобнее будет описывать их, дополнять, расширять
class MapSizeDto {
  @ApiProperty({
    description: 'Width of the map',
    example: 100,
  })
  public width: number;

  @ApiProperty({
    description: 'Height of the map',
    example: 100,
  })
  public height: number;
}

class SpawnPointDto {
  @ApiProperty({
    description: 'X coordinate of the spawn point',
    example: 10,
  })
  public x: number;

  @ApiProperty({
    description: 'Y coordinate of the spawn point',
    example: 10,
  })
  public y: number;
}

export class MapDto {
  @ApiProperty({
    description: 'Unique map identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  public id: string;

  @ApiProperty({
    description: 'Dimensions of the map',
    type: MapSizeDto,
  })
  @IsObject()
  public size: MapSizeDto;

  @ApiProperty({
    description: '2D array representing the map terrain',
    example: [
      [
        'Dirt',
        'Rock',
        'Bedrock',
      ],
      [
        'Dirt',
        'Dirt',
        'Bedrock',
      ],
    ],
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.values(TerrainType),
      },
    },
    enum: Object.values(TerrainType),
  })
  @IsArray()
  @IsArray({ each: true })
  @IsEnum(TerrainType, { each: true })
  public terrainData: TerrainType[][];

  @ApiProperty({
    description: 'List of spawn points for players',
    type: [SpawnPointDto],
  })
  @IsArray()  // Если оставить только этот декоратор, то по сути ты сможешь сюда записать хоть массив строк через постман и ошибки не будет
  // @IsNotEmpty()
  // @ValidateNested({each: true})
  // @Type(() =>SpawnPointDto )
  public spawnPoints: SpawnPointDto[];
}
