import { Vector2 } from '@libs/utils';
import { randomBoolean } from '@libs/utils';
import { calculateContiguousProbability } from './noise.algorithm';
import {
  GridCell,
  FloodFillConfig,
  FloodFillCallbacks,
  DIRECTIONS_8,
} from '../types/grid.types';

export interface FloodFillOptions {
  /** Starting point for flood fill */
  center: Vector2;

  /** Value to set in cells */
  value: any;

  /** Configuration for probability calculation */
  config: FloodFillConfig;

  /** Callbacks for grid interaction */
  callbacks: FloodFillCallbacks;

  /** Directions to expand (default: 8-directional) */
  directions?: Vector2[];

  /** Maximum cells to process (safety limit) */
  maxCells?: number;
}

export interface FloodFillResult {
  /** Number of cells modified */
  cellsModified: number;

  /** Number of cells processed */
  cellsProcessed: number;

  /** Whether hit safety limit */
  hitLimit: boolean;

  /** All points that were modified */
  modifiedPoints: Vector2[];
}

/**
 * Universal flood fill algorithm using BFS with probabilistic expansion
 */
export function floodFill(options: FloodFillOptions): FloodFillResult {
  const {
    center,
    value,
    config,
    callbacks,
    directions = DIRECTIONS_8,
    maxCells = 10000,
  } = options;

  const visited = new Set<string>();
  const queue: GridCell[] = [];
  const modifiedPoints: Vector2[] = [];

  let cellsModified = 0;
  let cellsProcessed = 0;
  let hitLimit = false;

  // Start from center
  queue.push({
    x: center.x,
    y: center.y,
    distance: 0,
  });
  visited.add(`${ center.x },${ center.y }`);

  while (queue.length > 0 && cellsProcessed < maxCells) {
    const current = queue.shift()!;
    const {
      x, y, distance,
    } = current;

    cellsProcessed++;

    const position = {
      x,
      y,
    };

    // Check bounds
    if (!callbacks.isInBounds(position)) {
      continue;
    }

    // Check if cell can be modified
    if (!callbacks.canModify(position)) {
      continue;
    }

    // Calculate probability for this cell
    const probability = calculateContiguousProbability({
      distance,
      radius: config.radius,
      baseDensity: config.density,
      falloffExponent: config.falloffExponent,
      noiseAmount: config.noiseAmount,
    });

    // Apply probabilistic placement
    if (randomBoolean(probability)) {
      callbacks.setCell(position, value);
      modifiedPoints.push({
        x,
        y,
      });
      cellsModified++;

      // Add neighbors to queue if within radius
      if (distance < config.radius) {
        for (const direction of directions) {
          const newX = x + direction.x;
          const newY = y + direction.y;
          const key = `${ newX },${ newY }`;

          if (!visited.has(key)) {
            visited.add(key);
            queue.push({
              x: newX,
              y: newY,
              distance: distance + 1,
            });
          }
        }
      }
    }
  }

  if (cellsProcessed >= maxCells) {
    hitLimit = true;
  }

  return {
    cellsModified,
    cellsProcessed,
    hitLimit,
    modifiedPoints,
  };
}

/**
 * Convenience function for simple grid-based flood fill
 */
export function floodFillGrid<T>(
  grid: T[][],
  center: Vector2,
  value: T,
  config: FloodFillConfig,
  canModifyPredicate: (x: number, y: number, currentValue: T) => boolean,
  directions: Vector2[] = DIRECTIONS_8,
): FloodFillResult {
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  const callbacks: FloodFillCallbacks<T> = {
    isInBounds: position => position.x >= 0 && position.x < width && position.y >= 0 && position.y < height,
    canModify: position => canModifyPredicate(position.x, position.y, grid[position.y][position.x]),
    setCell: (position, val) => { grid[position.y][position.x] = val; },
    getCell: position => grid[position.y][position.x],
  };

  return floodFill({
    center,
    value,
    config,
    callbacks,
    directions,
  });
}
