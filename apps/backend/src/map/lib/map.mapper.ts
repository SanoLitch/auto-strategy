/**
 * Маппер для преобразования данных карты между слоями.
 * - toDomain: persistence -> domain
 * - toPersistence: domain -> persistence
 * - toDto: domain -> DTO
 */
import {
  Map as MapDb, Prisma,
} from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import {
  Map, TerrainType, MapSize, SpawnPoint,
} from '../domain/map.entity';
import { MapDto } from '../api/map.dto';

export class MapMapper {
  /**
   * Преобразовать persistence-модель в доменную сущность.
   */
  static toEntity(mapDb: MapDb): Map {
    return new Map({
      id: new Uuid(mapDb.id),
      size: MapSize.fromJSON(mapDb.size),
      terrainData: mapDb.terrain_data as TerrainType[][],
      spawnPoints: (mapDb.spawn_points as Prisma.JsonArray).map(point => SpawnPoint.fromJSON(point)),
    });
  }

  /**
   * Преобразовать доменную сущность в persistence-модель (plain object).
   */
  static toPersistence(map: Map): Partial<MapDb> {
    return {
      id: map.getId(),
      size: map.size.toJSON(),
      terrain_data: map.terrainData,
      spawn_points: map.spawnPoints.map(point => point.toJSON()),
    };
  }

  /**
   * Преобразовать доменную сущность в DTO.
   */
  static toDto(map: Map): MapDto {
    return {
      id: map.getId(),
      size: map.size,
      terrainData: map.terrainData,
      spawnPoints: map.spawnPoints,
    };
  }
}
