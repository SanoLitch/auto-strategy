import {
  Uuid, MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import { Vector2 } from '@libs/utils';
import {
  GridGenerator,
  FormationGenerator,
  PlacementGenerator,
  GeometryUtils,
  NoiseGenerator,
  DistanceCalculator,
} from '@libs/map-generation';

export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
  Empty = 'Empty',
  GoldCluster = 'GoldCluster',
  CrystalCluster = 'CrystalCluster',
  IronCluster = 'IronCluster',
}

export class Map {
  public readonly id: Uuid;
  public readonly size: MapSize;
  public terrainData: TerrainType[][];
  public spawnPoints: SpawnPoint[];

  constructor(params: {
    id: Uuid;
    size: MapSize;
    terrainData?: TerrainType[][];
    spawnPoints?: SpawnPoint[];
  }) {
    this.id = params.id;
    this.size = params.size;
    this.terrainData = params.terrainData ?? [];
    this.spawnPoints = params.spawnPoints ?? [];
  }

  public generateTerrain(): void {
    const size: Vector2 = {
      x: this.size.x,
      y: this.size.y,
    };

    this.terrainData = GridGenerator.createDistanceBased<TerrainType>(
      size,
      normalizedDistance => {
        const random = Math.random();
        const rockProbability = normalizedDistance * 0.6;
        const bedrockProbability = (1 - normalizedDistance) * 0.8;

        if (random < bedrockProbability) {
          return TerrainType.Bedrock;
        } else if (random < bedrockProbability + rockProbability) {
          return TerrainType.Rock;
        }
        return TerrainType.Dirt;
      },
    );

    this.generateBedrockFormations();
    this.addRockVariations();
    this.ensureSpawnAccessibility();
  }

  public generateTerrainWithResources(playersCount: number): void {
    this.generateTerrain();
    this.generateZonedResourceDeposits(playersCount);
    this.ensureSpawnAccessibilityWithResources();
  }

  private generateZonedResourceDeposits(playersCount: number): void {
    const mapArea = this.size.x * this.size.y;
    const center = GeometryUtils.getMapCenter({
      x: this.size.x,
      y: this.size.y,
    });
    const maxDistance = GeometryUtils.getMaxDistanceFromCenter({
      x: this.size.x,
      y: this.size.y,
    });

    const zones = [
      {
        name: 'central',
        centerX: center.x,
        centerY: center.y,
        radius: maxDistance * 0.4,
        weight: 1,
      },
      {
        name: 'middle',
        centerX: center.x,
        centerY: center.y,
        radius: maxDistance * 0.7,
        weight: 0.7,
      },
      {
        name: 'outer',
        centerX: center.x,
        centerY: center.y,
        radius: maxDistance,
        weight: 0.5,
      },
    ];

    const baseResourceDensity = 0.025;
    const playerMultiplier = 1.3;

    const totalGoldClusters = Math.floor(
      mapArea * baseResourceDensity * Math.pow(playerMultiplier, Math.max(0, playersCount - 2)),
    );
    const totalIronClusters = Math.floor(totalGoldClusters * 0.8);
    const totalCrystalClusters = Math.floor(totalGoldClusters * 0.3);

    const placementConfig = {
      zones,
      objects: [
        {
          type: 'crystal',
          count: totalCrystalClusters,
          allowedZones: ['central'],
          clustering: {
            radius: 5,
            density: 0.95,
            falloffType: 'exponential' as const,
          },
        },
        {
          type: 'gold',
          count: totalGoldClusters,
          allowedZones: ['central', 'middle'],
          clustering: {
            radius: 4,
            density: 0.85,
            falloffType: 'quadratic' as const,
          },
        },
        {
          type: 'iron',
          count: totalIronClusters,
          allowedZones: ['middle', 'outer'],
          clustering: {
            radius: 3,
            density: 0.75,
            falloffType: 'linear' as const,
          },
        },
      ],
      spacing: {
        sameType: 8,
        differentTypes: 15,
      },
    };

    const placedObjects = PlacementGenerator.placeInZones(
      this.terrainData,
      placementConfig,
      TerrainType.Dirt,
    );

    // Применяем правильные типы ресурсов
    for (const obj of placedObjects) {
      let resourceType: TerrainType;

      switch (obj.value) {
      case 'crystal':
        resourceType = TerrainType.CrystalCluster;
        break;
      case 'gold':
        resourceType = TerrainType.GoldCluster;
        break;
      case 'iron':
        resourceType = TerrainType.IronCluster;
        break;
      default:
        resourceType = TerrainType.Dirt;
      }
      this.terrainData[obj.y][obj.x] = resourceType;
    }
  }

  private generateBedrockFormations(): void {
    const formationCount = Math.floor((this.size.x * this.size.y) / 2000);

    for (let i = 0; i < formationCount; i++) {
      const center = GeometryUtils.randomPosition({
        x: this.size.x,
        y: this.size.y,
      });

      FormationGenerator.createRadialFormation(
        this.terrainData,
        center,
        {
          density: 0.8,
          radius: {
            min: 3,
            max: 8,
          },
          intensity: {
            min: 0.6,
            max: 1.0,
          },
        },
        (distance, intensity, existing) => {
          const probability = Math.max(0, 1 - distance / 8) * intensity;

          return Math.random() < probability ? TerrainType.Bedrock : existing;
        },
      );
    }

    const veinCount = Math.floor(formationCount / 2);

    for (let i = 0; i < veinCount; i++) {
      const start = GeometryUtils.randomPosition({
        x: this.size.x,
        y: this.size.y,
      });
      const length = 15 + Math.random() * 25;
      const angle = Math.random() * 2 * Math.PI;
      const end = {
        x: Math.floor(start.x + Math.cos(angle) * length),
        y: Math.floor(start.y + Math.sin(angle) * length),
      };

      FormationGenerator.createLinearFormation(
        this.terrainData,
        start,
        end,
        2,
        (distanceFromLine, existing) => {
          const probability = Math.max(0, 1 - distanceFromLine / 2) * 0.7;

          return Math.random() < probability ? TerrainType.Bedrock : existing;
        },
      );
    }
  }

  private addRockVariations(): void {
    const noiseScale = 0.1;
    const threshold = 0.3;

    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        if (this.terrainData[y][x] === TerrainType.Dirt) {
          const noiseValue = NoiseGenerator.perlinNoise(x * noiseScale, y * noiseScale);

          if (noiseValue > threshold) {
            const distanceFromCenter = GeometryUtils.normalizeDistanceFromCenter(x, y, {
              x: this.size.x,
              y: this.size.y,
            });
            const rockProbability = distanceFromCenter * 0.4;

            if (Math.random() < rockProbability) {
              this.terrainData[y][x] = TerrainType.Rock;
            }
          }
        }
      }
    }
  }

  private ensureSpawnAccessibility(): void {
    if (this.spawnPoints.length === 0) return;

    const spawnPositions = this.spawnPoints.map(sp => sp.toJSON());
    const blockingTerrain = [TerrainType.Bedrock, TerrainType.Rock];

    PlacementGenerator.ensureAccessibility(
      this.terrainData,
      spawnPositions,
      TerrainType.Dirt,
      blockingTerrain,
      3,
    );
  }

  public generateSpawnPoints(playersCount: number): void {
    const margin = 10;
    const minDistance = Math.floor(Math.min(this.size.x, this.size.y) / Math.max(2, playersCount - 1));

    const positions = PlacementGenerator.placeAroundEdges(
      this.terrainData,
      playersCount,
      margin,
      minDistance,
      TerrainType.Dirt,
    );

    this.spawnPoints = positions.map(pos => new SpawnPoint(pos.x, pos.y));
  }

  public digTerrain(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) {
      return false;
    }

    const currentTerrain = this.terrainData[y][x];

    if (currentTerrain === TerrainType.Bedrock || currentTerrain === TerrainType.Empty) {
      return false;
    }

    this.terrainData[y][x] = TerrainType.Empty;
    return true;
  }

  public isTerrainPassable(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) {
      return false;
    }

    const terrain = this.terrainData[y][x];

    return terrain !== TerrainType.Bedrock && terrain !== TerrainType.Rock;
  }

  public canBuildAt(x: number, y: number): boolean {
    return this.isValidPosition(x, y) && this.terrainData[y][x] === TerrainType.Dirt;
  }

  private ensureSpawnAccessibilityWithResources(): void {
    if (this.spawnPoints.length === 0) return;

    for (const spawn of this.spawnPoints) {
      const spawnPos = spawn.toJSON();

      this.clearAreaAroundSpawn(spawnPos.x, spawnPos.y, 5);
      this.placeGuaranteedSpawnResources(spawnPos.x, spawnPos.y, 8, 15);
    }
  }

  private clearAreaAroundSpawn(spawnX: number, spawnY: number, radius: number): void {
    const blockingTerrain = [
      TerrainType.Bedrock,
      TerrainType.Rock,
      TerrainType.GoldCluster,
      TerrainType.IronCluster,
      TerrainType.CrystalCluster,
    ];

    PlacementGenerator.ensureAccessibility(
      this.terrainData,
      [
        {
          x: spawnX,
          y: spawnY,
        },
      ],
      TerrainType.Dirt,
      blockingTerrain,
      radius,
    );
  }

  private placeGuaranteedSpawnResources(
    spawnX: number,
    spawnY: number,
    minDistance: number,
    maxDistance: number,
  ): void {
    const guaranteedResources = [
      {
        type: TerrainType.GoldCluster,
        count: 2,
      },
      {
        type: TerrainType.IronCluster,
        count: 3,
      },
    ];

    for (const resource of guaranteedResources) {
      const positions = PlacementGenerator.placeInCircle(
        this.terrainData,
        {
          x: spawnX,
          y: spawnY,
        },
        maxDistance,
        resource.count,
        resource.type,
      );

      for (const pos of positions) {
        FormationGenerator.createContiguousCluster(
          this.terrainData,
          pos,
          8,
          resource.type,
          (position, grid) => {
            const distance = DistanceCalculator.euclidean(
              {
                x: spawnX,
                y: spawnY,
              },
              position,
            );

            return distance >= minDistance && grid[position.y][position.x] === TerrainType.Dirt;
          },
        );
      }
    }
  }

  private isValidPosition(x: number, y: number): boolean {
    return GeometryUtils.isWithinBounds(x, y, {
      x: this.size.x,
      y: this.size.y,
    });
  }
}
