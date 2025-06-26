import { Vector2 } from '@libs/utils';

/**
 * Утилиты для расчета различных типов расстояний
 */
export class DistanceCalculator {
  /**
   * Евклидово расстояние между двумя точками
   */
  public static euclidean(pos1: Vector2, pos2: Vector2): number {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }

  /**
   * Манхэттенское расстояние (сумма модулей разностей координат)
   */
  public static manhattan(pos1: Vector2, pos2: Vector2): number {
    return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
  }

  /**
   * Расстояние Чебышева (максимальная разность координат)
   */
  public static chebyshev(pos1: Vector2, pos2: Vector2): number {
    return Math.max(Math.abs(pos2.x - pos1.x), Math.abs(pos2.y - pos1.y));
  }

  /**
   * Находит ближайшую позицию из списка
   */
  public static findNearestPosition(
    target: Vector2,
    positions: Vector2[],
  ): Vector2 | null {
    if (positions.length === 0) return null;

    let nearest = positions[0];
    let minDistance = this.euclidean(target, nearest);

    for (let i = 1; i < positions.length; i++) {
      const distance = this.euclidean(target, positions[i]);

      if (distance < minDistance) {
        minDistance = distance;
        nearest = positions[i];
      }
    }

    return nearest;
  }

  /**
   * Находит самую дальнюю позицию из списка
   */
  public static findFarthest(target: Vector2, positions: Vector2[]): Vector2 | null {
    if (positions.length === 0) return null;

    let farthest = positions[0];
    let maxDistance = this.euclidean(target, farthest);

    for (let i = 1; i < positions.length; i++) {
      const distance = this.euclidean(target, positions[i]);

      if (distance > maxDistance) {
        maxDistance = distance;
        farthest = positions[i];
      }
    }

    return farthest;
  }

  /**
   * Фильтрует позиции по минимальному расстоянию от целевой точки
   */
  public static filterByDistance(
    center: Vector2,
    positions: Vector2[],
    minDistance: number,
    maxDistance: number,
  ): Vector2[] {
    return positions.filter(pos => {
      const distance = this.euclidean(center, pos);

      return distance >= minDistance && distance <= maxDistance;
    });
  }

  /**
   * Проверяет, соблюдается ли минимальное расстояние между позицией и списком других позиций
   */
  public static isMinDistanceRespected(
    position: Vector2,
    existingPositions: Vector2[],
    minDistance: number,
  ): boolean {
    for (const existing of existingPositions) {
      if (this.euclidean(position, existing) < minDistance) {
        return false;
      }
    }
    return true;
  }

  /**
   * Группирует позиции в кластеры на основе расстояния
   */
  public static clusterByDistance(
    positions: Vector2[],
    maxClusterDistance: number,
  ): Vector2[][] {
    if (positions.length === 0) return [];

    const clusters: Vector2[][] = [];
    const visited = new Set<number>();

    for (let i = 0; i < positions.length; i++) {
      if (visited.has(i)) continue;

      const cluster: Vector2[] = [];
      const queue = [i];

      while (queue.length > 0) {
        const currentIndex = queue.pop()!;

        if (visited.has(currentIndex)) continue;

        visited.add(currentIndex);
        cluster.push(positions[currentIndex]);

        for (let j = 0; j < positions.length; j++) {
          if (!visited.has(j)) {
            const distance = this.euclidean(positions[currentIndex], positions[j]);

            if (distance <= maxClusterDistance) {
              queue.push(j);
            }
          }
        }
      }

      clusters.push(cluster);
    }

    return clusters;
  }

  /**
   * Вычисляет среднюю позицию для списка позиций
   */
  public static calculateCentroid(positions: Vector2[]): Vector2 {
    if (positions.length === 0) {
      throw new Error('Cannot calculate centroid of empty position array');
    }

    const sum = positions.reduce(
      (acc, pos) => ({
        x: acc.x + pos.x,
        y: acc.y + pos.y,
      }),
      {
        x: 0,
        y: 0,
      },
    );

    return {
      x: Math.floor(sum.x / positions.length),
      y: Math.floor(sum.y / positions.length),
    };
  }

  /**
   * Сортирует позиции по расстоянию от целевой точки
   */
  public static sortByDistanceFrom(
    reference: Vector2,
    positions: Vector2[],
  ): Vector2[] {
    return [...positions].sort((a, b) => {
      const distanceA = this.euclidean(reference, a);
      const distanceB = this.euclidean(reference, b);

      return distanceA - distanceB;
    });
  }

  public static getAverageDistance(positions: Vector2[]): number {
    if (positions.length < 2) return 0;

    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        totalDistance += this.euclidean(positions[i], positions[j]);
        pairCount++;
      }
    }

    return totalDistance / pairCount;
  }

  public static getMinDistance(positions: Vector2[]): number {
    if (positions.length < 2) return 0;

    let minDistance = Infinity;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = this.euclidean(positions[i], positions[j]);

        if (distance < minDistance) {
          minDistance = distance;
        }
      }
    }

    return minDistance;
  }

  public static getMaxDistance(positions: Vector2[]): number {
    if (positions.length < 2) return 0;

    let maxDistance = 0;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = this.euclidean(positions[i], positions[j]);

        if (distance > maxDistance) {
          maxDistance = distance;
        }
      }
    }

    return maxDistance;
  }

  public static getPositionsWithinRadius(
    center: Vector2,
    positions: Vector2[],
    radius: number,
  ): Vector2[] {
    return positions.filter(pos => this.euclidean(center, pos) <= radius);
  }
}
