import { MapSize } from '@libs/domain-primitives';
import {
  euclideanDistance,
  randomBoolean,
} from '@libs/utils';
import {
  calculateRadialProbability,
} from '@libs/map-generation';
import { TerrainType } from '../domain/types';
import { type BedrockFormationConfig } from '../domain/terrain-generation.rules';

export class BedrockFormationGenerator {
  public static generateFormation(
    terrainData: TerrainType[][],
    size: MapSize,
    formation: BedrockFormationConfig,
  ): void {
    const {
      centerX, centerY, radius,
    } = formation;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (this.isValidPosition(x, y, size)) {
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

  public static generateMultipleFormations(
    terrainData: TerrainType[][],
    size: MapSize,
    formations: BedrockFormationConfig[],
  ): void {
    formations.forEach(formation => {
      this.generateFormation(terrainData, size, formation);
    });
  }

  private static isValidPosition(x: number, y: number, size: MapSize): boolean {
    return x >= 0 && x < size.x && y >= 0 && y < size.y;
  }
}
