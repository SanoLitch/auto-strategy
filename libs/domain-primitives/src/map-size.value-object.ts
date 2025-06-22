import {
  type Vector2, isVector2,
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
