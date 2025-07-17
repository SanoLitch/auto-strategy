import {
  MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import { euclideanDistance } from '@libs/utils';
import { TerrainType } from '../domain/types';
import { type SpawnClearanceConfig } from '../domain/terrain-generation.rules';

export class SpawnClearer {
  public static clearSpawnAreas(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
    config: SpawnClearanceConfig,
    immediateTerrainType: TerrainType,
    downgradeTerrain: Partial<Record<TerrainType, TerrainType>>,
    resourceTypes: TerrainType[],
  ): void {
    spawnPoints.forEach(spawnPoint => {
      const spawnData = spawnPoint.toJSON();

      this.clearSingleSpawnArea(
        terrainData,
        spawnData.x,
        spawnData.y,
        size,
        config,
        immediateTerrainType,
        downgradeTerrain,
        resourceTypes,
      );
    });
  }

  private static clearSingleSpawnArea(
    terrainData: TerrainType[][],
    spawnX: number,
    spawnY: number,
    size: MapSize,
    config: SpawnClearanceConfig,
    immediateTerrainType: TerrainType,
    downgradeTerrain: Partial<Record<TerrainType, TerrainType>>,
    resourceTypes: TerrainType[],
  ): void {
    const {
      immediateRadius, clearRadius,
    } = config;

    for (let dy = -clearRadius; dy <= clearRadius; dy++) {
      for (let dx = -clearRadius; dx <= clearRadius; dx++) {
        const x = spawnX + dx;
        const y = spawnY + dy;

        if (this.isValidPosition(x, y, size)) {
          const distance = euclideanDistance(0, 0, dx, dy);

          if (distance <= immediateRadius) {
            terrainData[y][x] = immediateTerrainType;
          } else if (distance <= clearRadius) {
            this.processOuterClearArea(
              terrainData,
              x,
              y,
              downgradeTerrain,
              resourceTypes,
            );
          }
        }
      }
    }
  }

  private static processOuterClearArea(
    terrainData: TerrainType[][],
    x: number,
    y: number,
    downgradeTerrain: Partial<Record<TerrainType, TerrainType>>,
    resourceTypes: TerrainType[],
  ): void {
    const currentTerrain = terrainData[y][x];

    const downgradeTo = downgradeTerrain[currentTerrain];

    if (downgradeTo !== undefined) {
      terrainData[y][x] = downgradeTo;
      return;
    }

    if (resourceTypes.includes(currentTerrain)) {
      terrainData[y][x] = TerrainType.Dirt;
    }
  }

  private static isValidPosition(x: number, y: number, size: MapSize): boolean {
    return x >= 0 && x < size.x && y >= 0 && y < size.y;
  }
}
