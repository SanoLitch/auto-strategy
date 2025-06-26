import { Vector2 } from '@libs/utils';

/**
 * Утилиты для геометрических операций на карте
 */
export class GeometryUtils {
  /**
   * Вычисляет расстояние между двумя точками
   */
  public static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Вычисляет расстояние между двумя позициями
   */
  public static distanceBetween(pos1: Vector2, pos2: Vector2): number {
    return this.distance(pos1.x, pos1.y, pos2.x, pos2.y);
  }

  /**
   * Проверяет находится ли позиция в границах карты
   */
  public static isWithinBounds(x: number, y: number, bounds: Vector2): boolean {
    return x >= 0 && x < bounds.x && y >= 0 && y < bounds.y;
  }

  /**
   * Проверяет находится ли позиция в границах карты
   */
  public static isPositionWithinBounds(position: Vector2, bounds: Vector2): boolean {
    return this.isWithinBounds(position.x, position.y, bounds);
  }

  /**
   * Получает 8 соседних позиций (включая диагональные)
   */
  public static getNeighbors8(x: number, y: number): Vector2[] {
    return [
      {
        x: x - 1,
        y: y - 1,
      },
      {
        x: x,
        y: y - 1,
      },
      {
        x: x + 1,
        y: y - 1,
      },
      {
        x: x - 1,
        y: y,
      },
      {
        x: x + 1,
        y: y,
      },
      {
        x: x - 1,
        y: y + 1,
      },
      {
        x: x,
        y: y + 1,
      },
      {
        x: x + 1,
        y: y + 1,
      },
    ];
  }

  /**
   * Получает 4 соседних позиции (только горизонтальные и вертикальные)
   */
  public static getNeighbors4(x: number, y: number): Vector2[] {
    return [
      {
        x: x,
        y: y - 1,
      },
      {
        x: x - 1,
        y: y,
      },
      {
        x: x + 1,
        y: y,
      },
      {
        x: x,
        y: y + 1,
      },
    ];
  }

  /**
   * Получает соседние позиции в границах карты
   */
  public static getValidNeighbors8(x: number, y: number, bounds: Vector2): Vector2[] {
    return this.getNeighbors8(x, y).filter(pos => this.isPositionWithinBounds(pos, bounds));
  }

  /**
   * Получает соседние позиции в границах карты (только 4 направления)
   */
  public static getValidNeighbors4(x: number, y: number, bounds: Vector2): Vector2[] {
    return this.getNeighbors4(x, y).filter(pos => this.isPositionWithinBounds(pos, bounds));
  }

  /**
   * Преобразует полярные координаты в декартовы
   */
  public static polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angle: number,
  ): Vector2 {
    return {
      x: Math.floor(centerX + Math.cos(angle) * radius),
      y: Math.floor(centerY + Math.sin(angle) * radius),
    };
  }

  /**
   * Проверяет находится ли точка в пределах круга
   */
  public static isWithinCircle(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radius: number,
  ): boolean {
    return this.distance(x, y, centerX, centerY) <= radius;
  }

  /**
   * Находит центр карты
   */
  public static getMapCenter(size: Vector2): Vector2 {
    return {
      x: Math.floor(size.x / 2),
      y: Math.floor(size.y / 2),
    };
  }

  /**
   * Вычисляет максимальное расстояние от центра карты до угла
   */
  public static getMaxDistanceFromCenter(size: Vector2): number {
    const center = this.getMapCenter(size);

    return Math.sqrt(center.x * center.x + center.y * center.y);
  }

  /**
   * Нормализует расстояние от центра карты (0-1)
   */
  public static normalizeDistanceFromCenter(
    x: number,
    y: number,
    size: Vector2,
  ): number {
    const center = this.getMapCenter(size);
    const distance = this.distance(x, y, center.x, center.y);
    const maxDistance = this.getMaxDistanceFromCenter(size);

    return distance / maxDistance;
  }

  /**
   * Генерирует случайную позицию в пределах карты
   */
  public static randomPosition(size: Vector2): Vector2 {
    return {
      x: Math.floor(Math.random() * size.x),
      y: Math.floor(Math.random() * size.y),
    };
  }

  /**
   * Генерирует случайную позицию в пределах круга
   */
  public static randomPositionInCircle(
    centerX: number,
    centerY: number,
    minRadius: number,
    maxRadius: number,
  ): Vector2 {
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const angle = Math.random() * 2 * Math.PI;

    return this.polarToCartesian(centerX, centerY, radius, angle);
  }

  /**
   * Проверяет, находится ли точка в круге
   */
  public static isInCircle(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radius: number,
  ): boolean {
    const distance = this.distance(x, y, centerX, centerY);

    return distance <= radius;
  }

  /**
   * Проверяет, находится ли точка в прямоугольнике
   */
  public static isInRectangle(
    x: number,
    y: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
  ): boolean {
    return x >= rectX && x < rectX + rectWidth
      && y >= rectY && y < rectY + rectHeight;
  }

  /**
   * Вычисляет угол между двумя точками (в радианах)
   */
  public static angleBetween(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Поворачивает точку вокруг центра на заданный угол
   */
  public static rotatePoint(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    angle: number,
  ): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dx = x - centerX;
    const dy = y - centerY;

    return {
      x: Math.floor(centerX + dx * cos - dy * sin),
      y: Math.floor(centerY + dx * sin + dy * cos),
    };
  }

  /**
   * Линейная интерполяция между двумя точками
   */
  public static lerpPosition(start: Vector2, end: Vector2, t: number): Vector2 {
    return {
      x: Math.floor(start.x + (end.x - start.x) * t),
      y: Math.floor(start.y + (end.y - start.y) * t),
    };
  }

  /**
   * Получает все точки на линии между двумя позициями (алгоритм Брезенхема)
   */
  public static getLinePoints(start: Vector2, end: Vector2): Vector2[] {
    const points: Vector2[] = [];

    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push({
        x: x0,
        y: y0,
      });

      if (x0 === x1 && y0 === y1) break;

      const e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return points;
  }
}
