export interface Vector2 {
  x: number;
  y: number;
}

export type Vector2Tuple = [number, number];

export function isVector2(arg: unknown): arg is Vector2 {
  return Boolean(
    arg
    && typeof arg === 'object'
    && 'x' in arg
    && 'y' in arg
    && Number.isInteger(arg.x)
    && Number.isInteger(arg.y),
  );
}
