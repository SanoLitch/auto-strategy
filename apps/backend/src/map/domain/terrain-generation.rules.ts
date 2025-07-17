import {
  MapSize,
} from '@libs/domain-primitives';
import { type LinearFormationConfig } from '@libs/map-generation';
import { TerrainType } from './types';

export interface TerrainGenerationConfig {
  terrainLayers: {
    rockLayer: {
      multiplier: number;
      invertDistance: boolean;
    };
    bedrockLayer: {
      multiplier: number;
      invertDistance: boolean;
    };
  };
  bedrockFormations: {
    densityPerTile: number;
    minRadius: number;
    maxRadius: number;
  };
  rockVariations: LinearFormationConfig;
  spawnClearance: {
    immediateRadius: number;
    clearRadius: number;
  };
}

export interface TerrainLayerConfig {
  multiplier: number;
  invertDistance: boolean;
}

export interface BedrockFormationConfig {
  centerX: number;
  centerY: number;
  radius: number;
}

export interface SpawnClearanceConfig {
  immediateRadius: number;
  clearRadius: number;
}

const DEFAULT_CONFIG: TerrainGenerationConfig = {
  terrainLayers: {
    rockLayer: {
      multiplier: 0.4,
      invertDistance: false,
    },
    bedrockLayer: {
      multiplier: 0.15,
      invertDistance: true,
    },
  },
  bedrockFormations: {
    densityPerTile: 800,
    minRadius: 2,
    maxRadius: 6,
  },
  rockVariations: {
    density: 2.5,
    minLength: 5,
    maxLength: 15,
    minThickness: 1,
    maxThickness: 3,
    noiseAmount: 1.0,
    placementProbability: 0.7,
  },
  spawnClearance: {
    immediateRadius: 2,
    clearRadius: 4,
  },
};

export class TerrainGenerationRules {
  private readonly config: TerrainGenerationConfig;

  constructor(config: Partial<TerrainGenerationConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      terrainLayers: {
        ...DEFAULT_CONFIG.terrainLayers,
        ...config.terrainLayers,
      },
      bedrockFormations: {
        ...DEFAULT_CONFIG.bedrockFormations,
        ...config.bedrockFormations,
      },
      rockVariations: {
        ...DEFAULT_CONFIG.rockVariations,
        ...config.rockVariations,
      },
      spawnClearance: {
        ...DEFAULT_CONFIG.spawnClearance,
        ...config.spawnClearance,
      },
    };
  }

  public getTerrainLayersConfig(): TerrainLayerConfig[] {
    return [this.config.terrainLayers.rockLayer, this.config.terrainLayers.bedrockLayer];
  }

  public calculateBedrockFormationsCount(size: MapSize): number {
    return Math.floor((size.x * size.y) / this.config.bedrockFormations.densityPerTile);
  }

  public generateBedrockFormationConfig(size: MapSize): BedrockFormationConfig {
    const centerX = Math.floor(Math.random() * size.x);
    const centerY = Math.floor(Math.random() * size.y);
    const radiusRange = this.config.bedrockFormations.maxRadius - this.config.bedrockFormations.minRadius;
    const radius = this.config.bedrockFormations.minRadius + Math.floor(Math.random() * radiusRange);

    return {
      centerX,
      centerY,
      radius,
    };
  }

  public getRockVariationsConfig(): LinearFormationConfig {
    return { ...this.config.rockVariations };
  }

  public getSpawnClearanceConfig(): SpawnClearanceConfig {
    return { ...this.config.spawnClearance };
  }

  public getTerrainTypesToClearInSpawnArea(): {
    resourceTypes: TerrainType[];
    terrainTypes: TerrainType[];
  } {
    return {
      resourceTypes: [
        TerrainType.GoldCluster,
        TerrainType.CrystalCluster,
        TerrainType.IronCluster,
      ],
      terrainTypes: [TerrainType.Bedrock],
    };
  }

  public getSpawnImmediateTerrainType(): TerrainType {
    return TerrainType.Empty;
  }

  public getSpawnDowngradeTerrain(): Partial<Record<TerrainType, TerrainType>> {
    return {
      [TerrainType.Bedrock]: TerrainType.Rock,
      [TerrainType.GoldCluster]: TerrainType.Dirt,
      [TerrainType.CrystalCluster]: TerrainType.Dirt,
      [TerrainType.IronCluster]: TerrainType.Dirt,
    };
  }
}
