import {
  Map as MapDb, Prisma,
} from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import {
  Map, TerrainType, MapSize, SpawnPoint,
} from '../domain/map.entity';
import { MapDto } from '../api/map.dto';

export class MapMapper {
  static toEntity(mapDb: MapDb): Map {
    return new Map({
      id: new Uuid(mapDb.id),
      size: MapSize.fromJSON(mapDb.size),
      terrainData: mapDb.terrain_data as TerrainType[][],
      spawnPoints: (mapDb.spawn_points as Prisma.JsonArray).map(point => SpawnPoint.fromJSON(point)),
    });
  }

  static toPersistence(map: Map): Partial<MapDb> {
    return {
      id: map.getId(),
      size: map.size.toJSON(),
      terrain_data: map.terrainData,
      spawn_points: map.spawnPoints.map(point => point.toJSON()),
    };
  }

  static toDto(map: Map): MapDto {
    return {
      id: map.getId(),
      size: map.size,
      terrainData: map.terrainData,
      spawnPoints: map.spawnPoints.map(({ point: [x, y] }) => ({
        x,
        y,
      })),
    };
  }
}
