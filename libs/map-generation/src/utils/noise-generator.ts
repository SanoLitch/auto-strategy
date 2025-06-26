import { Range } from '../types/generation-config';

/**
 * Утилиты для генерации случайных значений и шума
 */
export class NoiseGenerator {
  private static permutation: number[] = [];
  private static initialized = false;

  private static initialize(): void {
    if (this.initialized) return;

    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }

    this.permutation = [...this.permutation, ...this.permutation];
    this.initialized = true;
  }

  /**
   * Генерирует случайное число в заданном диапазоне
   */
  public static randomInRange(range: Range): number {
    return range.min + Math.random() * (range.max - range.min);
  }

  /**
   * Генерирует случайное целое число в заданном диапазоне
   */
  public static randomIntInRange(range: Range): number {
    return Math.floor(this.randomInRange(range));
  }

  /**
   * Генерирует случайное число между min и max
   */
  public static randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  /**
   * Генерирует случайное целое число между min и max
   */
  public static randomIntBetween(min: number, max: number): number {
    return Math.floor(this.randomBetween(min, max));
  }

  /**
   * Генерирует случайное булево значение с заданной вероятностью
   */
  public static randomBoolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  }

  /**
   * Простой перлинов шум (упрощенная версия)
   */
  public static simpleNoise(x: number, y: number, scale: number = 1): number {
    const scaledX = x * scale;
    const scaledY = y * scale;

    // Простая реализация псевдослучайного шума
    const noise = Math.sin(scaledX * 12.9898 + scaledY * 78.233) * 43758.5453;

    return noise - Math.floor(noise);
  }

  /**
   * Нормализованный шум (значения от 0 до 1)
   */
  public static normalizedNoise(x: number, y: number, scale: number = 1): number {
    return Math.abs(this.simpleNoise(x, y, scale));
  }

  /**
   * Генерирует сид для воспроизводимой генерации
   */
  public static generateSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }

  /**
   * Воспроизводимый случайный генератор на основе сида
   */
  public static seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;

    return x - Math.floor(x);
  }

  /**
   * Плавная интерполяция между двумя значениями
   */
  public static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));

    return t * t * (3 - 2 * t);
  }

  /**
   * Линейная интерполяция между двумя значениями
   */
  public static lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  public static perlinNoise(x: number, y: number): number {
    this.initialize();

    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const a = this.permutation[X] + Y;
    const aa = this.permutation[a];
    const ab = this.permutation[a + 1];
    const b = this.permutation[X + 1] + Y;
    const ba = this.permutation[b];
    const bb = this.permutation[b + 1];

    return this.lerp(
      v,
      this.lerp(
        u,
        this.grad(this.permutation[aa], x, y),
        this.grad(this.permutation[ba], x - 1, y),
      ),
      this.lerp(
        u,
        this.grad(this.permutation[ab], x, y - 1),
        this.grad(this.permutation[bb], x - 1, y - 1),
      ),
    );
  }

  public static octaveNoise(
    x: number,
    y: number,
    octaves: number,
    persistence: number,
    scale: number,
  ): number {
    let value = 0;
    let amplitude = 1;
    let frequency = scale;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.perlinNoise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return value / maxValue;
  }

  public static whiteNoise(): number {
    return Math.random() * 2 - 1;
  }

  public static smoothNoise(x: number, y: number, smoothness: number = 1): number {
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    const fracX = x - intX;
    const fracY = y - intY;

    const a = this.whiteNoise();
    const b = this.whiteNoise();
    const c = this.whiteNoise();
    const d = this.whiteNoise();

    const i1 = this.interpolate(a, b, fracX);
    const i2 = this.interpolate(c, d, fracX);

    return this.interpolate(i1, i2, fracY);
  }

  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private static grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;

    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  private static interpolate(a: number, b: number, t: number): number {
    const f = (1 - Math.cos(t * Math.PI)) * 0.5;

    return a * (1 - f) + b * f;
  }
}
