import { Vector2 } from '@libs/utils';
import { GridGenerator } from './grid-generator';
import {
  Grid, CellValue,
} from '../types/cell-types';
import {
  FormationConfig, ClusterConfig,
} from '../types/generation-config';
import { GeometryUtils } from '../utils/geometry-utils';
import { NoiseGenerator } from '../utils/noise-generator';

/**
 * Универсальный генератор формаций и кластеров
 */
export class FormationGenerator {
  /**
   * Создает радиальную формацию в сетке
   */
  public static createRadialFormation<T extends CellValue>(
    grid: Grid<T>,
    center: Vector2,
    config: FormationConfig,
    valueCalculator: (distance: number, intensity: number, existing: T) => T,
  ): void {
    const radius = NoiseGenerator.randomInRange(config.radius);
    const intensity = NoiseGenerator.randomInRange(config.intensity);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const position = {
          x: center.x + dx,
          y: center.y + dy,
        };

        if (!GeometryUtils.isWithinBounds(position.x, position.y, {
          x: grid[0].length,
          y: grid.length,
        })) {
          continue;
        }

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          const existingValue = grid[position.y][position.x];
          const newValue = valueCalculator(distance, intensity, existingValue);

          grid[position.y][position.x] = newValue;
        }
      }
    }
  }

  /**
   * Создает линейную формацию (жилу)
   */
  public static createLinearFormation<T extends CellValue>(
    grid: Grid<T>,
    start: Vector2,
    end: Vector2,
    width: number,
    valueCalculator: (distanceFromLine: number, existing: T) => T,
  ): void {
    const line = GeometryUtils.getLinePoints(start, end);

    for (const point of line) {
      for (let dy = -width; dy <= width; dy++) {
        for (let dx = -width; dx <= width; dx++) {
          const position = {
            x: point.x + dx,
            y: point.y + dy,
          };

          if (!GeometryUtils.isWithinBounds(position.x, position.y, {
            x: grid[0].length,
            y: grid.length,
          })) {
            continue;
          }

          const distanceFromLine = Math.sqrt(dx * dx + dy * dy);

          if (distanceFromLine <= width) {
            const existingValue = grid[position.y][position.x];
            const newValue = valueCalculator(distanceFromLine, existingValue);

            grid[position.y][position.x] = newValue;
          }
        }
      }
    }
  }

  /**
   * Создает контурную формацию (связный кластер)
   */
  public static createContiguousCluster<T extends CellValue>(
    grid: Grid<T>,
    center: Vector2,
    targetSize: number,
    value: T,
    validator?: (position: Vector2, grid: Grid<T>) => boolean,
  ): Vector2[] {
    const placed: Vector2[] = [];
    const queue: Vector2[] = [center];
    const visited = new Map<string, boolean>();

    while (queue.length > 0 && placed.length < targetSize) {
      const current = queue.shift()!;
      const key = `${ current.x },${ current.y }`;

      if (visited.has(key)) continue;
      visited.set(key, true);

      if (!GeometryUtils.isWithinBounds(current.x, current.y, {
        x: grid[0].length,
        y: grid.length,
      })) {
        continue;
      }

      if (validator && !validator(current, grid)) {
        continue;
      }

      grid[current.y][current.x] = value;
      placed.push(current);

      const neighbors = GeometryUtils.getNeighbors4(current.x, current.y);

      for (const neighbor of neighbors) {
        const neighborKey = `${ neighbor.x },${ neighbor.y }`;

        if (!visited.has(neighborKey) && Math.random() < 0.7) {
          queue.push(neighbor);
        }
      }
    }

    return placed;
  }

  /**
   * Генерирует множественные формации по конфигурации
   */
  public static generateFormations<T extends CellValue>(
    grid: Grid<T>,
    config: FormationConfig,
    value: T,
  ): Vector2[] {
    const size = GridGenerator.getSize(grid);
    const formationCount = Math.floor((size.x * size.y) / config.density);
    const placements: Vector2[] = [];

    for (let i = 0; i < formationCount; i++) {
      const center: Vector2 = {
        x: Math.floor(Math.random() * size.x),
        y: Math.floor(Math.random() * size.y),
      };

      const radius = NoiseGenerator.randomIntInRange(config.radius);
      const intensity = NoiseGenerator.randomInRange(config.intensity);

      this.createRadialFormation(
        grid,
        center,
        {
          radius: {
            min: radius,
            max: radius,
          },
          intensity: {
            min: intensity,
            max: intensity,
          },
          density: 1,
        },
        (distance, intensity, existing) => {
          const probability = Math.max(0, 1 - distance / radius) * intensity;

          return probability > Math.random() ? existing : value;
        },
      );

      placements.push(center);
    }

    return placements;
  }

  /**
   * Сглаживает формации (убирает изолированные значения)
   */
  public static smoothFormations<T extends CellValue>(
    grid: Grid<T>,
    targetValue: T,
    replacementValue: T,
    minNeighbors: number = 2,
  ): void {
    const size = GridGenerator.getSize(grid);
    const toReplace: Vector2[] = [];

    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const currentValue = GridGenerator.getValue(grid, {
          x,
          y,
        });

        if (currentValue === targetValue) {
          const neighbors = GeometryUtils.getValidNeighbors8(x, y, size);
          const matchingNeighbors = neighbors.filter(pos =>
            GridGenerator.getValue(grid, pos) === targetValue);

          if (matchingNeighbors.length < minNeighbors) {
            toReplace.push({
              x,
              y,
            });
          }
        }
      }
    }

    // Заменяем изолированные значения
    toReplace.forEach(pos => {
      GridGenerator.setValue(grid, pos, replacementValue);
    });
  }

  /**
   * Создает область вокруг позиции с заданным значением
   */
  public static clearArea<T extends CellValue>(
    grid: Grid<T>,
    center: Vector2,
    radius: number,
    clearValue: T,
  ): void {
    const size = GridGenerator.getSize(grid);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = center.x + dx;
        const y = center.y + dy;

        if (GeometryUtils.isWithinBounds(x, y, size)) {
          const distance = GeometryUtils.distance(center.x, center.y, x, y);

          if (distance <= radius) {
            GridGenerator.setValue(grid, {
              x,
              y,
            }, clearValue);
          }
        }
      }
    }
  }
}
