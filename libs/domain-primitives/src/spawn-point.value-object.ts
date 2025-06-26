import {
  type Vector2, type Vector2Tuple, isVector2,
} from '@libs/utils';

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
