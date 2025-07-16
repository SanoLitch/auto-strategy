export function randomFloat(min: number = 0, max: number = 1): number {
  return Math.random() * (max - min) + min;
}

export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

export function clamp(value: number, min: number = 0, max: number = 1): number {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
}

export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}
