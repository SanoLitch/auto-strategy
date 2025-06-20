import { Prisma } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';

/**
 * Value Object для размера карты.
 */
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

  /**
   * Создать MapSize из JSON-объекта (например, из Prisma JsonValue).
   */
  static fromJSON(json: Prisma.JsonValue): MapSize {
    const {
      width, height,
    } = json as Prisma.JsonObject;

    return new MapSize(Number(width), Number(height));
  }
}

/**
 * Value Object для точки спауна.
 */
export class SpawnPoint {
  constructor(private readonly x: number, private readonly y: number) {
    if (x < 0 || y < 0) {
      throw new Error('SpawnPoint: x and y must be non-negative');
    }
    this.x = x;
    this.y = y;
  }

  toJSON(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * Создать SpawnPoint из JSON-объекта (например, из Prisma JsonValue).
   */
  static fromJSON(json: Prisma.JsonValue): SpawnPoint {
    const {
      x, y,
    } = json as Prisma.JsonObject;

    return new SpawnPoint(Number(x), Number(y));
  }
}

/**
 * Value Object для типа породы.
 */
export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
}

/**
 * Доменная сущность карты.
 *
 * Пример:
 * const map = new Map({
 *   id: Uuid.create(),
 *   size: new MapSize(100, 100),
 *   terrainData: [],
 *   spawnPoints: []
 * });
 * map.generateTerrain();
 * map.generateSpawnPoints(playersCount);
 */
export class Map {
  /** Уникальный идентификатор карты (Value Object) */
  private readonly id: Uuid;
  /** Размеры карты */
  readonly size: MapSize;
  /** Данные о ландшафте (двумерный массив типов пород) */
  terrainData: TerrainType[][];
  /** Координаты стартовых позиций */
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

  /**
   * Получить строковое значение UUID карты.
   */
  getId(): string {
    return this.id.getValue();
  }

  /**
   * Сгенерировать ландшафт карты (terrainData) и сохранить в this.terrainData.
   */
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

  /**
   * Сгенерировать стартовые точки для игроков и сохранить в this.spawnPoints.
   * @param playersCount Количество игроков
   */
  generateSpawnPoints(playersCount: number): void {
    const points: SpawnPoint[] = [];

    if (playersCount >= 1) points.push(new SpawnPoint(1, 1));
    if (playersCount >= 2) points.push(new SpawnPoint(this.size.width - 2, this.size.height - 2));
    if (playersCount >= 3) points.push(new SpawnPoint(1, this.size.height - 2));
    if (playersCount >= 4) points.push(new SpawnPoint(this.size.width - 2, 1));
    // TODO: Более сложная логика для >4 игроков
    this.spawnPoints = points;
  }
}
