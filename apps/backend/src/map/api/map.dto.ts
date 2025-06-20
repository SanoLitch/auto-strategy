import {
  MapSize, TerrainType, SpawnPoint,
} from '../domain/map.entity';

export interface MapDto {
  id: string;
  size: MapSize;
  terrainData: TerrainType[][];
  spawnPoints: SpawnPoint[];
}
