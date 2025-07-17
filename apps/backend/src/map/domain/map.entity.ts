import {
  Uuid, MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import { MapTerrainGenerator } from './terrain-generator.service';
import {
  MapResourceGenerator,
  ResourceGenerationParams,
} from './resource-generator.service';
import { ResourceGenerationConfig } from './resource-generation.rules';
import { MapSpawnGenerator } from './spawn-generator.service';
import { TerrainType } from './types';

export class Map {
  public readonly id: Uuid;
  public readonly size: MapSize;
  public terrainData: TerrainType[][];
  public spawnPoints: SpawnPoint[];

  private readonly terrainGenerator: MapTerrainGenerator;
  private readonly resourceGenerator: MapResourceGenerator;
  private readonly spawnCalculator: MapSpawnGenerator;

  constructor(
    params: {
      id: Uuid;
      size: MapSize;
      terrainData?: TerrainType[][];
      spawnPoints?: SpawnPoint[];
    },
  ) {
    this.id = params.id;
    this.size = params.size;
    this.terrainData = params.terrainData ?? [];
    this.spawnPoints = params.spawnPoints ?? [];

    this.terrainGenerator = new MapTerrainGenerator();
    this.resourceGenerator = new MapResourceGenerator();
    this.spawnCalculator = new MapSpawnGenerator();
  }

  public generateTerrain(): void {
    this.terrainData = this.terrainGenerator.generateBaseTerrain(this.size);
    this.terrainGenerator.ensureSpawnAccessibility(this.terrainData, this.spawnPoints, this.size);
  }

  public generateTerrainWithResources(
    playersCount: number,
    config?: Partial<ResourceGenerationConfig>,
  ): void {
    this.generateTerrain();

    const resourceParams: ResourceGenerationParams = {
      terrainData: this.terrainData,
      spawnPoints: this.spawnPoints,
      size: this.size,
      playersCount,
      config,
    };

    this.resourceGenerator.generateZonedResourceDeposits(resourceParams);
    this.resourceGenerator.placeGuaranteedSpawnResources(resourceParams);
  }

  public generateSpawnPoints(playersCount: number): void {
    this.spawnPoints = this.spawnCalculator.calculateSpawnPoints(this.size, playersCount);
  }

  public digTerrain(x: number, y: number): boolean {
    if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
      return false;
    }
    const currentTerrain = this.terrainData[y][x];

    if (currentTerrain === TerrainType.Bedrock) {
      return false;
    }

    if (currentTerrain !== TerrainType.Empty) {
      this.terrainData[y][x] = TerrainType.Empty;
      return true;
    }

    return false;
  }

  public isTerrainPassable(x: number, y: number): boolean {
    if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
      return false;
    }
    const terrain = this.terrainData[y][x];

    return terrain === TerrainType.Empty;
  }

  public canBuildAt(x: number, y: number): boolean {
    return this.isTerrainPassable(x, y);
  }
}
