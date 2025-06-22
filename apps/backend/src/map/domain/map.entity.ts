import { Uuid } from '@libs/domain-primitives';
import {
  type Vector2, type Vector2Tuple, isVector2,
} from '@libs/utils';

export class MapSize {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    if (x <= 0 || y <= 0) {
      throw new Error('MapSize: width and height must be positive');
    }
    this.x = x;
    this.y = y;
  }

  public toJSON(): Vector2 {
    return {
      x: this.x,
      y: this.y,
    };
  }

  public static fromJSON(json: unknown): MapSize {
    if (!isVector2(json)) {
      throw new Error('Failed to create SpawnPoint from JSON');
    }
    return new MapSize(Number(json.x), Number(json.y));
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

  public get point(): Vector2Tuple {
    return [this.x, this.y];
  }

  public toJSON(): Vector2 {
    return {
      x: this.x,
      y: this.y,
    };
  }

  public static fromJSON(json: unknown): SpawnPoint {
    if (!isVector2(json)) {
      throw new Error('Failed to create SpawnPoint from JSON');
    }
    return new SpawnPoint(Number(json.x), Number(json.y));
  }
}

export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
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
    const types = [
      TerrainType.Dirt,
      TerrainType.Rock,
      TerrainType.Bedrock,
    ];

    this.terrainData = Array.from({ length: this.size.y }, () =>
      Array.from({ length: this.size.x }, () =>
        types[Math.floor(Math.random() * types.length)] as TerrainType));
  }

  public generateSpawnPoints(playersCount: number): void {
    const points: SpawnPoint[] = [];

    if (playersCount >= 1) points.push(new SpawnPoint(1, 1));
    if (playersCount >= 2) points.push(new SpawnPoint(this.size.x - 2, this.size.y - 2));
    if (playersCount >= 3) points.push(new SpawnPoint(1, this.size.y - 2));
    if (playersCount >= 4) points.push(new SpawnPoint(this.size.x - 2, 1));

    this.spawnPoints = points;
  }
}
