import { Vector2 } from '@libs/utils';
import {
  Grid, CellValue, CellInitializer,
} from '../types/cell-types';

/**
 * Универсальный генератор 2D сеток
 */
export class GridGenerator {
  /**
   * Создает пустую сетку заданного размера
   */
  public static createEmpty<T extends CellValue>(
    size: Vector2,
    defaultValue: T,
  ): Grid<T> {
    const grid: Grid<T> = [];

    for (let y = 0; y < size.y; y++) {
      const row: T[] = [];

      for (let x = 0; x < size.x; x++) {
        row.push(defaultValue);
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * Создает сетку с использованием функции инициализации
   */
  public static createWith<T extends CellValue>(
    size: Vector2,
    initializer: CellInitializer<T>,
  ): Grid<T> {
    const grid: Grid<T> = [];

    for (let y = 0; y < size.y; y++) {
      const row: T[] = [];

      for (let x = 0; x < size.x; x++) {
        row.push(initializer(x, y));
      }
      grid.push(row);
    }
    return grid;
  }

  /**
   * Создает сетку на основе функции расстояния от центра
   */
  public static createDistanceBased<T extends CellValue>(
    size: Vector2,
    distanceFunction: (normalizedDistance: number, x: number, y: number) => T,
  ): Grid<T> {
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    return this.createWith(size, (x, y) => {
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const normalizedDistance = distance / maxDistance;

      return distanceFunction(normalizedDistance, x, y);
    });
  }

  /**
   * Создает сетку с использованием шума
   */
  public static createNoiseBased<T extends CellValue>(
    size: Vector2,
    noiseFunction: (x: number, y: number) => number,
    valueMapper: (noiseValue: number, x: number, y: number) => T,
  ): Grid<T> {
    return this.createWith(size, (x, y) => {
      const noise = noiseFunction(x, y);

      return valueMapper(noise, x, y);
    });
  }

  /**
   * Клонирует существующую сетку
   */
  public static clone<T extends CellValue>(grid: Grid<T>): Grid<T> {
    return grid.map(row => [...row]);
  }

  /**
   * Проверяет корректность позиции в сетке
   */
  public static isValidPosition<T extends CellValue>(
    grid: Grid<T>,
    position: Vector2,
  ): boolean {
    return (
      position.x >= 0
      && position.x < grid[0].length
      && position.y >= 0
      && position.y < grid.length
    );
  }

  /**
   * Безопасно получает значение из сетки
   */
  public static getValue<T extends CellValue>(
    grid: Grid<T>,
    position: Vector2,
    defaultValue?: T,
  ): T | undefined {
    if (!this.isValidPosition(grid, position)) {
      return defaultValue;
    }
    return grid[position.y][position.x];
  }

  /**
   * Безопасно устанавливает значение в сетке
   */
  public static setValue<T extends CellValue>(
    grid: Grid<T>,
    position: Vector2,
    value: T,
  ): boolean {
    if (!this.isValidPosition(grid, position)) {
      return false;
    }
    grid[position.y][position.x] = value;
    return true;
  }

  /**
   * Применяет функцию ко всем клеткам сетки
   */
  public static transform<T extends CellValue, U extends CellValue>(
    grid: Grid<T>,
    transformer: (value: T, x: number, y: number) => U,
  ): Grid<U> {
    const result: Grid<U> = [];

    for (let y = 0; y < grid.length; y++) {
      const row: U[] = [];

      for (let x = 0; x < grid[y].length; x++) {
        row.push(transformer(grid[y][x], x, y));
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Фильтрует позиции в сетке по условию
   */
  public static filterPositions<T extends CellValue>(
    grid: Grid<T>,
    predicate: (value: T, x: number, y: number) => boolean,
  ): Vector2[] {
    const positions: Vector2[] = [];

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (predicate(grid[y][x], x, y)) {
          positions.push({
            x,
            y,
          });
        }
      }
    }
    return positions;
  }

  /**
   * Получает размер сетки
   */
  public static getSize<T extends CellValue>(grid: Grid<T>): Vector2 {
    return {
      x: grid.length > 0 ? grid[0].length : 0,
      y: grid.length,
    };
  }
}
