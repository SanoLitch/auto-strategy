import {
  MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import { TerrainType } from './types';
import {
  TerrainGenerationRules,
  type TerrainGenerationConfig,
} from './terrain-generation.rules';
import { TerrainLayersGenerator } from '../lib/terrain-layers.generator';
import { BedrockFormationGenerator } from '../lib/bedrock-formation.generator';
import { RockVariationGenerator } from '../lib/rock-variation.generator';
import { SpawnClearer } from '../lib/spawn-clearer';

export interface TerrainGenerationParams {
  size: MapSize;
  spawnPoints?: SpawnPoint[];
  config?: Partial<TerrainGenerationConfig>;
}

export class MapTerrainGenerator {
  private readonly rules: TerrainGenerationRules;

  constructor(config: Partial<TerrainGenerationConfig> = {}) {
    this.rules = new TerrainGenerationRules(config);
  }

  public generateBaseTerrain(params: TerrainGenerationParams): TerrainType[][] {
    const terrainData = Array.from({ length: params.size.y }, () =>
      Array.from({ length: params.size.x }, () => TerrainType.Dirt));

    this.generateTerrainLayers(terrainData, params.size);
    this.generateBedrockFormations(terrainData, params.size);
    this.addRockVariations(terrainData);

    return terrainData;
  }

  public ensureSpawnAccessibility(params: TerrainGenerationParams & { terrainData: TerrainType[][] }): void {
    if (!params.spawnPoints || params.spawnPoints.length === 0) {
      return;
    }
    const clearanceConfig = this.rules.getSpawnClearanceConfig();
    const immediateTerrainType = this.rules.getSpawnImmediateTerrainType();
    const downgradeTerrain = this.rules.getSpawnDowngradeTerrain();
    const { resourceTypes } = this.rules.getTerrainTypesToClearInSpawnArea();

    SpawnClearer.clearSpawnAreas(
      params.terrainData,
      params.spawnPoints,
      params.size,
      clearanceConfig,
      immediateTerrainType,
      downgradeTerrain,
      resourceTypes,
    );
  }

  private generateTerrainLayers(terrainData: TerrainType[][], size: MapSize): void {
    const layersConfig = this.rules.getTerrainLayersConfig();

    TerrainLayersGenerator.generateBaseLayers(terrainData, size, layersConfig);
  }

  private generateBedrockFormations(terrainData: TerrainType[][], size: MapSize): void {
    const formationCount = this.rules.calculateBedrockFormationsCount(size);
    const formations = Array.from({ length: formationCount }, () =>
      this.rules.generateBedrockFormationConfig(size));

    BedrockFormationGenerator.generateMultipleFormations(terrainData, size, formations);
  }

  private addRockVariations(terrainData: TerrainType[][]): void {
    const config = this.rules.getRockVariationsConfig();

    RockVariationGenerator.generateVariations(terrainData, config);
  }
}
