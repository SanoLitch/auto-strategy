import {
  MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import {
  euclideanDistance,
  distanceFromCenter,
  maxDistanceFromCenter,
  randomBoolean,
} from '@libs/utils';
import {
  calculateMultiLayerProbabilities,
  calculateRadialProbability,
  generateLinearFormationsOnGrid,
  type LinearFormationConfig,
} from '@libs/map-generation';
import { TerrainType } from './types';

export class MapTerrainGenerator {
  public generateBaseTerrain(size: MapSize): TerrainType[][] {
    const terrainData = Array.from({ length: size.y }, () =>
      Array.from({ length: size.x }, () => TerrainType.Dirt));

    this.generateTerrainLayers(terrainData, size);
    this.generateBedrockFormations(terrainData, size);
    this.addRockVariations(terrainData);

    return terrainData;
  }

  public ensureSpawnAccessibility(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
  ): void {
    for (const spawnPoint of spawnPoints) {
      const spawnData = spawnPoint.toJSON();

      this.clearSpawnArea(terrainData, spawnData.x, spawnData.y, size);
    }
  }

  private generateTerrainLayers(terrainData: TerrainType[][], size: MapSize): void {
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);

    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const currentDistanceFromCenter = distanceFromCenter(x, y, centerX, centerY);
        const maxDistance = maxDistanceFromCenter(size.x, size.y);
        const normalizedDistance = currentDistanceFromCenter / maxDistance;

        const [rockProbability, bedrockProbability] = calculateMultiLayerProbabilities({
          normalizedDistance,
          layers: [
            {
              multiplier: 0.4,
              invertDistance: false,
            },
            {
              multiplier: 0.15,
              invertDistance: true,
            },
          ],
        });

        const random = Math.random();

        if (random < bedrockProbability) {
          terrainData[y][x] = TerrainType.Bedrock;
        } else if (random < bedrockProbability + rockProbability) {
          terrainData[y][x] = TerrainType.Rock;
        }
      }
    }
  }

  private generateBedrockFormations(terrainData: TerrainType[][], size: MapSize): void {
    const formationCount = Math.floor((size.x * size.y) / 800);

    for (let i = 0; i < formationCount; i++) {
      const centerX = Math.floor(Math.random() * size.x);
      const centerY = Math.floor(Math.random() * size.y);
      const radius = 2 + Math.floor(Math.random() * 4);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;

          if (x >= 0 && x < size.x && y >= 0 && y < size.y) {
            const distance = euclideanDistance(0, 0, dx, dy);
            const probability = calculateRadialProbability({
              distance,
              radius,
            });

            if (randomBoolean(probability)) {
              terrainData[y][x] = TerrainType.Bedrock;
            }
          }
        }
      }
    }
  }

  private addRockVariations(terrainData: TerrainType[][]): void {
    const formationConfig: LinearFormationConfig = {
      density: 2.5,
      minLength: 5,
      maxLength: 15,
      minThickness: 1,
      maxThickness: 3,
      noiseAmount: 1.0,
      placementProbability: 0.7,
    };

    generateLinearFormationsOnGrid(
      terrainData,
      formationConfig,
      TerrainType.Rock,
      (x, y, currentValue, newValue) => currentValue === TerrainType.Dirt,
    );
  }

  private clearSpawnArea(
    terrainData: TerrainType[][],
    spawnX: number,
    spawnY: number,
    size: MapSize,
  ): void {
    const immediateRadius = 2;
    const clearRadius = 4;

    for (let dy = -clearRadius; dy <= clearRadius; dy++) {
      for (let dx = -clearRadius; dx <= clearRadius; dx++) {
        const x = spawnX + dx;
        const y = spawnY + dy;

        if (x >= 0 && x < size.x && y >= 0 && y < size.y) {
          const distance = euclideanDistance(0, 0, dx, dy);

          if (distance <= immediateRadius) {
            terrainData[y][x] = TerrainType.Empty;
          } else if (distance <= clearRadius) {
            if (terrainData[y][x] === TerrainType.Bedrock) {
              terrainData[y][x] = TerrainType.Rock;
            }
            if (terrainData[y][x] === TerrainType.GoldCluster
              || terrainData[y][x] === TerrainType.CrystalCluster
              || terrainData[y][x] === TerrainType.IronCluster) {
              terrainData[y][x] = TerrainType.Dirt;
            }
          }
        }
      }
    }
  }
}
