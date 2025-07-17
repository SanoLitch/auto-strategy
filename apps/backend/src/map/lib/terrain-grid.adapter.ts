import { Vector2 } from '@libs/utils';
import { MapSize } from '@libs/domain-primitives';
import { TerrainType } from '../domain/types';

// Интерфейс для совместимости с библиотекой map-generation
interface TerrainGrid {
  width: number;
  height: number;
  isInBounds(position: Vector2): boolean;
  canModify(position: Vector2): boolean;
  setCell(position: Vector2, value: any): void;
  getCell(position: Vector2): any;
}

/**
 * Адаптер для TerrainType[][] к интерфейсу TerrainGrid
 * Позволяет техническим алгоритмам работать с доменной моделью terrain
 */
export class TerrainGridAdapter implements TerrainGrid {
  public readonly width: number;
  public readonly height: number;

  constructor(
    private readonly terrain: TerrainType[][],
    private readonly size: MapSize,
  ) {
    this.width = size.x;
    this.height = size.y;
  }

  public isInBounds(position: Vector2): boolean {
    return position.x >= 0 && position.x < this.width
      && position.y >= 0 && position.y < this.height;
  }

  public canModify(position: Vector2): boolean {
    if (!this.isInBounds(position)) {
      return false;
    }

    // Нельзя модифицировать скалу
    return this.terrain[position.y][position.x] !== TerrainType.Bedrock;
  }

  public setCell(position: Vector2, value: any): void {
    if (!this.isInBounds(position)) {
      return;
    }

    this.terrain[position.y][position.x] = value as TerrainType;
  }

  public getCell(position: Vector2): any {
    if (!this.isInBounds(position)) {
      return undefined;
    }

    return this.terrain[position.y][position.x];
  }
}
