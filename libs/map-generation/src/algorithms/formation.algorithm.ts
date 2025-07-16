import { Vector2 } from '@libs/utils';
import { randomFloat } from '../utils/noise.utils';

export interface LinearFormationConfig {
  /** Density of formations per area unit (formations per 1000 cells) */
  density: number;
  /** Minimum length of each formation */
  minLength: number;
  /** Maximum length of each formation */
  maxLength: number;
  /** Minimum thickness of formations */
  minThickness: number;
  /** Maximum thickness of formations */
  maxThickness: number;
  /** Amount of noise to add for organic look (0.0 - 1.0) */
  noiseAmount: number;
  /** Probability of placing element at each position (0.0 - 1.0) */
  placementProbability: number;
}

export interface FormationCallbacks<T = any> {
  /** Check if position is within bounds */
  isInBounds: (position: Vector2) => boolean;
  /** Check if element can be placed at position */
  canPlace: (position: Vector2, currentValue: T) => boolean;
  /** Place element at position */
  placeElement: (position: Vector2, value: T) => void;
}

export interface FormationGenerationConfig<T = any> {
  /** Size of the area to generate in */
  areaSize: Vector2;
  /** Configuration for formations */
  formationConfig: LinearFormationConfig;
  /** Value to place in formations */
  elementValue: T;
  /** Callbacks for grid interaction */
  callbacks: FormationCallbacks<T>;
}

export interface FormationResult {
  /** Number of formations generated */
  formationsGenerated: number;
  /** Total number of elements placed */
  elementsPlaced: number;
  /** Number of attempted placements */
  attemptedPlacements: number;
}

/**
 * Generates linear formations (veins, lines, patterns) on a grid
 * This is a universal algorithm that can create rock veins, roads, rivers, etc.
 */
export function generateLinearFormations<T>(
  config: FormationGenerationConfig<T>,
): FormationResult {
  const {
    areaSize, formationConfig, elementValue, callbacks,
  } = config;

  // Calculate number of formations based on area and density
  const totalArea = areaSize.x * areaSize.y;
  const formationCount = Math.floor((totalArea * formationConfig.density) / 1000);

  let formationsGenerated = 0;
  let elementsPlaced = 0;
  let attemptedPlacements = 0;

  for (let i = 0; i < formationCount; i++) {
    const formation = generateSingleFormation(config);

    if (formation.elementsPlaced > 0) {
      formationsGenerated++;
    }

    elementsPlaced += formation.elementsPlaced;
    attemptedPlacements += formation.attemptedPlacements;
  }

  return {
    formationsGenerated,
    elementsPlaced,
    attemptedPlacements,
  };
}

/**
 * Generates a single linear formation
 */
function generateSingleFormation<T>(
  config: FormationGenerationConfig<T>,
): FormationResult {
  const {
    areaSize, formationConfig, elementValue, callbacks,
  } = config;

  // Generate random start position
  const startPosition: Vector2 = {
    x: Math.floor(Math.random() * areaSize.x),
    y: Math.floor(Math.random() * areaSize.y),
  };

  // Generate random direction
  const direction = Math.random() * 2 * Math.PI;

  // Generate random length
  const length = formationConfig.minLength
    + Math.floor(Math.random() * (formationConfig.maxLength - formationConfig.minLength + 1));

  let elementsPlaced = 0;
  let attemptedPlacements = 0;

  // Generate formation along the line
  for (let step = 0; step < length; step++) {
    const linePosition: Vector2 = {
      x: Math.floor(startPosition.x + Math.cos(direction) * step),
      y: Math.floor(startPosition.y + Math.sin(direction) * step),
    };

    // Skip if line position is out of bounds
    if (!callbacks.isInBounds(linePosition)) {
      continue;
    }

    // Generate random thickness for this segment
    const thickness = formationConfig.minThickness
      + Math.floor(Math.random() * (formationConfig.maxThickness - formationConfig.minThickness + 1));

    // Generate noise offset
    const noiseX = (Math.random() - 0.5) * 2 * formationConfig.noiseAmount;
    const noiseY = (Math.random() - 0.5) * 2 * formationConfig.noiseAmount;

    // Apply thickness around the line point
    for (let dy = -thickness; dy <= thickness; dy++) {
      for (let dx = -thickness; dx <= thickness; dx++) {
        const position: Vector2 = {
          x: linePosition.x + dx + Math.floor(noiseX),
          y: linePosition.y + dy + Math.floor(noiseY),
        };

        attemptedPlacements++;

        // Check bounds
        if (!callbacks.isInBounds(position)) {
          continue;
        }

        // Check if we can place element here
        if (!callbacks.canPlace(position, elementValue)) {
          continue;
        }

        // Apply probability
        if (Math.random() > formationConfig.placementProbability) {
          continue;
        }

        // Place the element
        callbacks.placeElement(position, elementValue);
        elementsPlaced++;
      }
    }
  }

  return {
    formationsGenerated: elementsPlaced > 0 ? 1 : 0,
    elementsPlaced,
    attemptedPlacements,
  };
}

/**
 * Convenience function for simple grid-based formation generation
 */
export function generateLinearFormationsOnGrid<T>(
  grid: T[][],
  config: LinearFormationConfig,
  elementValue: T,
  canPlacePredicate: (x: number, y: number, currentValue: T, newValue: T) => boolean,
): FormationResult {
  const height = grid.length;
  const width = height > 0 ? grid[0].length : 0;

  const callbacks: FormationCallbacks<T> = {
    isInBounds: position =>
      position.x >= 0 && position.x < width && position.y >= 0 && position.y < height,
    canPlace: (position, value) =>
      canPlacePredicate(position.x, position.y, grid[position.y][position.x], value),
    placeElement: (position, value) => {
      grid[position.y][position.x] = value;
    },
  };

  return generateLinearFormations({
    areaSize: {
      x: width,
      y: height,
    },
    formationConfig: config,
    elementValue,
    callbacks,
  });
}
