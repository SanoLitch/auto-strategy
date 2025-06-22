import { Map as MapDb } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import {
  Map, TerrainType, MapSize, SpawnPoint,
} from '../domain/map.entity';
import { MapDto } from '../api/map.dto';

export class MapMapper {
  public static toEntity(mapDb: MapDb): Map {
    return new Map({
      id: new Uuid(mapDb.id),
      size: MapSize.fromJSON(mapDb.size),
      terrainData: mapDb.terrainData as TerrainType[][],
      spawnPoints: mapDb.spawnPoints.map(point => SpawnPoint.fromJSON(point)),
    });
  }

  public static toPersistence(map: Map, sessionId: string): MapDb {
    return {
      id: map.id.getValue(),
      size: map.size.toJSON(),
      gameSessionId: sessionId,
      terrainData: map.terrainData,
      spawnPoints: map.spawnPoints.map(point => point.toJSON()),
    };
  }

  public static toDto(map: Map): MapDto {
    return {
      id: map.id.getValue(),
      size: {
        width: map.size.x,
        height: map.size.y,
      },
      terrainData: map.terrainData,
      spawnPoints: map.spawnPoints.map(({ point: [x, y] }) => ({
        x,
        y,
      })),
    };
  }
}
