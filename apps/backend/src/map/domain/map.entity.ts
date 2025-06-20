/**
 * Доменная сущность карты.
 */
export class Map {
  /** Уникальный идентификатор карты */
  readonly id: string;
  /** Название карты */
  readonly name: string;
  /** Размеры карты */
  readonly size: Record<string, number>;
  /** Данные о ландшафте */
  readonly terrainData: unknown;
  /** Координаты стартовых позиций */
  readonly spawnPoints: Record<string, number>[];

  constructor(params: {
    id: string;
    name: string;
    size: Record<string, number>;
    terrainData: unknown;
    spawnPoints: Record<string, number>[];
  }) {
    this.id = params.id;
    this.name = params.name;
    this.size = params.size;
    this.terrainData = params.terrainData;
    this.spawnPoints = params.spawnPoints;
  }
}
