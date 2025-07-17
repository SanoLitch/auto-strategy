import { Vector2 } from '@libs/utils';
import { MapSize } from '@libs/domain-primitives';
import { TerrainType } from '../domain/types';

interface TerrainGrid {
  width: number;
  height: number;
  isInBounds(position: Vector2): boolean;
  canModify(position: Vector2): boolean;
  setCell(position: Vector2, value: TerrainType): void;
  getCell(position: Vector2): TerrainType;
}

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
    return position.x >= 0
      && position.x < this.width
      && position.y >= 0
      && position.y < this.height;
  }

  public canModify(position: Vector2): boolean {
    if (!this.isInBounds(position)) {
      return false;
    }
    return this.terrain[position.y][position.x] !== TerrainType.Bedrock;
  }

  public setCell(position: Vector2, value: TerrainType): void {
    if (!this.isInBounds(position)) {
      return;
    }
    this.terrain[position.y][position.x] = value;
  }

  public getCell(position: Vector2): any {
    if (!this.isInBounds(position)) {
      return undefined;
    }
    return this.terrain[position.y][position.x];
  }
}
