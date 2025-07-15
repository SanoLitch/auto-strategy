/**
 * Universal grid types for flood fill algorithms
 */
import { Vector2 } from '@libs/utils';

export interface GridCell extends Vector2 {
  distance: number;
}

export interface FloodFillConfig {
  radius: number;
  density: number;
  falloffExponent?: number;
  noiseAmount?: number;
}

export interface FloodFillCallbacks<T = any> {
  /** Check if coordinates are within bounds */
  isInBounds: (position: Vector2) => boolean;

  /** Check if cell can be modified (e.g., not bedrock) */
  canModify: (position: Vector2) => boolean;

  /** Set cell value */
  setCell: (position: Vector2, value: T) => void;

  /** Get cell value (optional, for complex logic) */
  getCell?: (position: Vector2) => T;
}

// Standard direction patterns
export const DIRECTIONS_4: Vector2[] = [
  { x: -1, y: 0 },  // Left
  { x: 1, y: 0 },   // Right
  { x: 0, y: -1 },  // Up
  { x: 0, y: 1 },   // Down
];

export const DIRECTIONS_8: Vector2[] = [
  ...DIRECTIONS_4,
  { x: -1, y: -1 }, // Top-left
  { x: 1, y: -1 },  // Top-right
  { x: -1, y: 1 },  // Bottom-left
  { x: 1, y: 1 },   // Bottom-right
];