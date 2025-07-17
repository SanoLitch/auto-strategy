import { MapSize } from '@libs/domain-primitives';
import {
  distanceFromCenter,
  maxDistanceFromCenter,
} from '@libs/utils';
import {
  calculateMultiLayerProbabilities,
} from '@libs/map-generation';
import { TerrainType } from '../domain/types';
import { type TerrainLayerConfig } from '../domain/terrain-generation.rules';

export class TerrainLayersGenerator {
  public static generateBaseLayers(
    terrainData: TerrainType[][],
    size: MapSize,
    layersConfig: TerrainLayerConfig[],
  ): void {
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);
    const maxDistance = maxDistanceFromCenter(size.x, size.y);

    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const currentDistanceFromCenter = distanceFromCenter(x, y, centerX, centerY);
        const normalizedDistance = currentDistanceFromCenter / maxDistance;

        const probabilities = calculateMultiLayerProbabilities({
          normalizedDistance,
          layers: layersConfig,
        });

        const random = Math.random();
        let cumulativeProbability = 0;

        for (let i = layersConfig.length - 1; i >= 0; i--) {
          cumulativeProbability += probabilities[i];

          if (random < cumulativeProbability) {
            terrainData[y][x] = this.getTerrainTypeForLayer(i);

            break;
          }
        }
      }
    }
  }

  private static getTerrainTypeForLayer(layerIndex: number): TerrainType {
    switch (layerIndex) {
    case 0:
      return TerrainType.Rock;
    case 1:
      return TerrainType.Bedrock;
    default:
      return TerrainType.Dirt;
    }
  }
}
