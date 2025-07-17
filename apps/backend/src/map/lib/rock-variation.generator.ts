import {
  generateLinearFormationsOnGrid,
  type LinearFormationConfig,
} from '@libs/map-generation';
import { TerrainType } from '../domain/types';

export class RockVariationGenerator {
  public static generateVariations(
    terrainData: TerrainType[][],
    config: LinearFormationConfig,
  ): void {
    generateLinearFormationsOnGrid(
      terrainData,
      config,
      TerrainType.Rock,
      this.canPlaceRockAt,
    );
  }

  private static canPlaceRockAt(
    x: number,
    y: number,
    currentValue: TerrainType,
    newValue: TerrainType,
  ): boolean {
    return currentValue === TerrainType.Dirt;
  }
}
