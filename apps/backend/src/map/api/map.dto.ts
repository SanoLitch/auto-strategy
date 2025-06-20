import {
  MapSize, TerrainType, SpawnPoint,
} from '../domain/map.entity';

/**
 * DTO для карты (ответ API).
 */
export interface MapDto {
  id: string;
  size: MapSize;
  terrainData: TerrainType[][];
  spawnPoints: SpawnPoint[];
}
