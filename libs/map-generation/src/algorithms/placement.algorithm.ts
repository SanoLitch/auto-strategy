import { Vector2 } from '@libs/utils';
import { euclideanDistance } from '../utils/math.utils';

export interface PlacementZone {
  /** Center of the zone */
  center: Vector2;
  /** Minimum distance from center */
  minRadius: number;
  /** Maximum distance from center */
  maxRadius: number;
}

export interface PlacementObject {
  /** Position of the object */
  position: Vector2;
  /** Type/identifier of the object */
  type: string;
  /** Radius/size of the object */
  radius: number;
}

export interface ExclusionZone {
  /** Center of the exclusion zone */
  center: Vector2;
  /** Radius of the exclusion zone */
  radius: number;
}

export interface PlacementConfig {
  /** Zone where to place the object */
  zone: PlacementZone;
  /** Type of object being placed */
  objectType: string;
  /** Already placed objects to check for conflicts */
  existingObjects: PlacementObject[];
  /** Zones to avoid (e.g., spawn protection) */
  exclusionZones?: ExclusionZone[];
  /** Minimum distance between objects */
  minDistance: number;
  /** Multiplier for distance when checking different object types */
  differentTypeDistanceMultiplier?: number;
  /** Margin from map edges */
  edgeMargin?: number;
  /** Maximum placement attempts */
  maxAttempts?: number;
}

export interface PlacementCallbacks {
  /** Check if position is within map bounds */
  isInBounds: (position: Vector2) => boolean;
  /** Additional custom validation (optional) */
  customValidation?: (position: Vector2) => boolean;
}

export interface PlacementResult {
  /** Found position, null if no valid position found */
  position: Vector2 | null;
  /** Number of attempts made */
  attempts: number;
  /** Whether placement was successful */
  success: boolean;
}

/**
 * Universal placement algorithm that finds valid positions in a ring zone
 * while avoiding conflicts with existing objects and exclusion zones
 */
export function findValidPosition(
  config: PlacementConfig,
  callbacks: PlacementCallbacks,
): PlacementResult {
  const {
    zone,
    objectType,
    existingObjects,
    exclusionZones = [],
    minDistance,
    differentTypeDistanceMultiplier = 1.5,
    edgeMargin = 5,
    maxAttempts = 200,
  } = config;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate random position in ring zone
    const angle = Math.random() * 2 * Math.PI;
    const distance = zone.minRadius + Math.random() * (zone.maxRadius - zone.minRadius);

    const position: Vector2 = {
      x: Math.floor(zone.center.x + Math.cos(angle) * distance),
      y: Math.floor(zone.center.y + Math.sin(angle) * distance),
    };

    // Check map bounds with margin
    if (!callbacks.isInBounds(position)) {
      continue;
    }

    // Check edge margins
    if (!callbacks.isInBounds({ x: position.x - edgeMargin, y: position.y - edgeMargin }) ||
        !callbacks.isInBounds({ x: position.x + edgeMargin, y: position.y + edgeMargin })) {
      continue;
    }

    // Check exclusion zones
    const inExclusionZone = exclusionZones.some(exclusionZone => {
      const distanceToZone = euclideanDistance(
        position.x,
        position.y,
        exclusionZone.center.x,
        exclusionZone.center.y,
      );
      return distanceToZone < exclusionZone.radius;
    });

    if (inExclusionZone) {
      continue;
    }

    // Check conflicts with existing objects
    const conflictingObject = existingObjects.find(existingObject => {
      const distanceToObject = euclideanDistance(
        position.x,
        position.y,
        existingObject.position.x,
        existingObject.position.y,
      );

      const requiredDistance = existingObject.type === objectType
        ? minDistance
        : minDistance * differentTypeDistanceMultiplier;

      return distanceToObject < requiredDistance;
    });

    if (conflictingObject) {
      continue;
    }

    // Custom validation (if provided)
    if (callbacks.customValidation && !callbacks.customValidation(position)) {
      continue;
    }

    // Found valid position
    return {
      position,
      attempts: attempt + 1,
      success: true,
    };
  }

  // No valid position found
  return {
    position: null,
    attempts: maxAttempts,
    success: false,
  };
}

/**
 * Convenience function to create exclusion zones from a list of points
 */
export function createExclusionZones(
  points: Vector2[],
  radius: number,
): ExclusionZone[] {
  return points.map(point => ({
    center: point,
    radius,
  }));
}