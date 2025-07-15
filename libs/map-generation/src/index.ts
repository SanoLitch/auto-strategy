/**
 * Map generation algorithms and utilities
 */

// Math utilities
export {
  euclideanDistance,
  distanceFromCenter,
  maxDistanceFromCenter,
  normalizedDistance,
} from './utils/math.utils';

// Noise utilities
export {
  randomFloat,
  randomBoolean,
  clamp,
  smoothstep,
  lerp,
} from './utils/noise.utils';

// Noise algorithms
export {
  calculateContiguousProbability,
  calculateMultiLayerProbabilities,
  calculateRadialProbability,
} from './algorithms/noise.algorithm';

// Flood fill algorithm
export {
  floodFill,
  floodFillGrid,
  type FloodFillOptions,
  type FloodFillResult,
} from './algorithms/flood-fill.algorithm';

// Placement algorithm
export {
  findValidPosition,
  createExclusionZones,
  type PlacementZone,
  type PlacementObject,
  type ExclusionZone,
  type PlacementConfig,
  type PlacementCallbacks,
  type PlacementResult,
} from './algorithms/placement.algorithm';

// Grid types
export {
  type GridCell,
  type FloodFillConfig,
  type FloodFillCallbacks,
  DIRECTIONS_4,
  DIRECTIONS_8,
} from './types/grid.types';