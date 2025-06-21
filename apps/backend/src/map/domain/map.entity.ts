import { Prisma } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';

export class MapSize {
  public readonly width: number;
  public readonly height: number;

  constructor(width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new Error('MapSize: width and height must be positive');
    }
    this.width = width;
    this.height = height;
  }

  toJSON(): { width: number; height: number } {
    return {
      width: this.width,
      height: this.height,
    };
  }

  static fromJSON(json: Prisma.JsonValue): MapSize {
    const {
      width, height,
    } = json as Prisma.JsonObject;

    return new MapSize(Number(width), Number(height));
  }
}

export class SpawnPoint {
  constructor(private readonly x: number, private readonly y: number) {
    if (x < 0 || y < 0) {
      throw new Error('SpawnPoint: x and y must be non-negative');
    }
    this.x = x;
    this.y = y;
  }

  get point() {
    return [this.x, this.y];
  }

  toJSON(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }

  static fromJSON(json: Prisma.JsonValue): SpawnPoint {
    const {
      x, y,
    } = json as Prisma.JsonObject;

    return new SpawnPoint(Number(x), Number(y));
  }
}

export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
}

export class Map {
  readonly id: Uuid;
  readonly size: MapSize;
  terrainData: TerrainType[][];
  spawnPoints: SpawnPoint[];

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

  generateTerrain(): void {
    const types = [
      TerrainType.Dirt,
      TerrainType.Rock,
      TerrainType.Bedrock,
    ];

    this.terrainData = Array.from({ length: this.size.height }, () =>
      Array.from({ length: this.size.width }, () =>
        types[Math.floor(Math.random() * types.length)] as TerrainType));
  }

  generateSpawnPoints(playersCount: number): void {
    const points: SpawnPoint[] = [];

    if (playersCount >= 1) points.push(new SpawnPoint(1, 1));
    if (playersCount >= 2) points.push(new SpawnPoint(this.size.width - 2, this.size.height - 2));
    if (playersCount >= 3) points.push(new SpawnPoint(1, this.size.height - 2));
    if (playersCount >= 4) points.push(new SpawnPoint(this.size.width - 2, 1));

    this.spawnPoints = points;
  }
}
