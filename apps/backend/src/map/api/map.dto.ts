import { ApiProperty } from '@nestjs/swagger';
import {
  MapSize, TerrainType, SpawnPoint,
} from '../domain/map.entity';

class MapSizeDto {
  @ApiProperty({
    description: 'Width of the map',
    example: 100,
  })
  width: number;

  @ApiProperty({
    description: 'Height of the map',
    example: 100,
  })
  height: number;
}

class SpawnPointDto {
  @ApiProperty({
    description: 'X coordinate of the spawn point',
    example: 10,
  })
  x: number;

  @ApiProperty({
    description: 'Y coordinate of the spawn point',
    example: 10,
  })
  y: number;
}

export class MapDto {
  @ApiProperty({
    description: 'Unique map identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Dimensions of the map',
    type: MapSizeDto,
  })
  size: MapSizeDto;

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
      items: { type: 'string' },
    },
  })
  terrainData: any; // В DTO оставляем any для гибкости, но в Swagger описываем точно

  @ApiProperty({
    description: 'List of spawn points for players',
    type: [SpawnPointDto],
  })
  spawnPoints: SpawnPointDto[];
}
