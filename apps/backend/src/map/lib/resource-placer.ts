import { Vector2 } from '@libs/utils';
import {
  PlacementCallbacks,
  PlacementZone,
  PlacementObject,
  ExclusionZone,
  createExclusionZones,
  findValidPosition,
  FloodFillCallbacks,
  floodFill,
} from '@libs/map-generation';
export interface ResourceCluster {
  position: Vector2;
  type: string;
  radius: number;
}

export interface PlacementConstraints {
  allowedZones: string[];
  minDistanceFromOtherTypes: number;
  minDistanceFromSameType: number;
  exclusionRadiusFromSpawns: number;
  getDistanceFor(resourceType: string, otherResourceType: string): number;
}

export interface ClusterConfig {
  minRadius: number;
  maxRadius: number;
  density: number;
  generateRadius(): number;
}

export interface ResourceZones {
  central: { center: Vector2; minRadius: number; maxRadius: number };
  middle: { center: Vector2; minRadius: number; maxRadius: number };
  outer: { center: Vector2; minRadius: number; maxRadius: number };
  getZone(zoneType: string): { center: Vector2; minRadius: number; maxRadius: number };
}

export interface TerrainGrid {
  width: number;
  height: number;
  isInBounds(position: Vector2): boolean;
  canModify(position: Vector2): boolean;
  setCell(position: Vector2, value: any): void;
  getCell(position: Vector2): any;
}

export interface ResourcePlacementResult {
  clustersPlaced: ResourceCluster[];
  totalAttempts: number;
  success: boolean;
}

export class ResourcePlacer {
  static placeResourceClusters(
    terrain: TerrainGrid,
    zones: ResourceZones,
    constraints: PlacementConstraints,
    clusterConfig: ClusterConfig,
    resourceType: string,
    count: number,
    spawnPoints: Vector2[],
    existingClusters: ResourceCluster[] = [],
  ): ResourcePlacementResult {
    const placedClusters: ResourceCluster[] = [];
    let totalAttempts = 0;

    for (let i = 0; i < count; i++) {
      let placed = false;

      for (const zoneType of constraints.allowedZones) {
        const zone = zones.getZone(zoneType);

        const position = this.findValidPositionInZone(
          zone,
          spawnPoints,
          [...existingClusters, ...placedClusters],
          constraints,
          resourceType,
          terrain,
        );

        if (position.success && position.position) {
          const radius = clusterConfig.generateRadius();
          const cluster: ResourceCluster = {
            position: position.position,
            type: resourceType,
            radius,
          };

          this.applyClusterToTerrain(terrain, cluster, clusterConfig);
          placedClusters.push(cluster);

          totalAttempts += position.attempts;
          placed = true;
          break;
        }

        totalAttempts += position.attempts;
      }

      if (!placed) {
        break;
      }
    }

    return {
      clustersPlaced: placedClusters,
      totalAttempts,
      success: placedClusters.length > 0,
    };
  }

  static placeGuaranteedSpawnResources(
    terrain: TerrainGrid,
    spawnPoints: Vector2[],
    resourceTypes: string[],
    clusterConfig: ClusterConfig,
    minDistance: number,
    maxDistance: number,
  ): ResourcePlacementResult {
    const placedClusters: ResourceCluster[] = [];
    let totalAttempts = 0;

    for (const spawnPoint of spawnPoints) {
      for (const resourceType of resourceTypes) {
        const result = this.placeResourceNearPosition(
          terrain,
          spawnPoint,
          resourceType,
          clusterConfig,
          minDistance,
          maxDistance,
        );

        if (result.success && result.cluster) {
          placedClusters.push(result.cluster);
        }
        totalAttempts += result.attempts;
      }
    }

    return {
      clustersPlaced: placedClusters,
      totalAttempts,
      success: placedClusters.length > 0,
    };
  }

  private static placeResourceNearPosition(
    terrain: TerrainGrid,
    position: Vector2,
    resourceType: string,
    clusterConfig: ClusterConfig,
    minDistance: number,
    maxDistance: number,
  ): { success: boolean; cluster?: ResourceCluster; attempts: number } {
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = minDistance + Math.random() * (maxDistance - minDistance);

      const targetPosition: Vector2 = {
        x: Math.floor(position.x + Math.cos(angle) * distance),
        y: Math.floor(position.y + Math.sin(angle) * distance),
      };

      if (terrain.isInBounds(targetPosition) && terrain.canModify(targetPosition)) {
        const radius = clusterConfig.generateRadius();
        const cluster: ResourceCluster = {
          position: targetPosition,
          type: resourceType,
          radius,
        };

        this.applyClusterToTerrain(terrain, cluster, clusterConfig);

        return {
          success: true,
          cluster,
          attempts: attempt + 1,
        };
      }
    }

    return {
      success: false,
      attempts: maxAttempts,
    };
  }

  private static findValidPositionInZone(
    zone: { center: Vector2; minRadius: number; maxRadius: number },
    spawnPoints: Vector2[],
    existingClusters: ResourceCluster[],
    constraints: PlacementConstraints,
    resourceType: string,
    terrain: TerrainGrid,
  ): { success: boolean; position: Vector2 | null; attempts: number } {
    const placementZone: PlacementZone = {
      center: zone.center,
      minRadius: zone.minRadius,
      maxRadius: zone.maxRadius,
    };

    const existingObjects: PlacementObject[] = existingClusters.map(cluster => ({
      position: cluster.position,
      type: cluster.type,
      radius: cluster.radius,
    }));

    const exclusionZones: ExclusionZone[] = createExclusionZones(
      spawnPoints,
      constraints.exclusionRadiusFromSpawns,
    );

    const callbacks: PlacementCallbacks = {
      isInBounds: (position: Vector2) => terrain.isInBounds(position),
      customValidation: (position: Vector2) => terrain.canModify(position),
    };

    const result = findValidPosition({
      zone: placementZone,
      objectType: resourceType,
      existingObjects,
      exclusionZones,
      minDistance: constraints.minDistanceFromSameType,
      differentTypeDistanceMultiplier: constraints.minDistanceFromOtherTypes / constraints.minDistanceFromSameType,
      edgeMargin: 5,
      maxAttempts: 200,
    }, callbacks);

    return {
      success: result.success,
      position: result.position,
      attempts: result.attempts,
    };
  }

  private static applyClusterToTerrain(
    terrain: TerrainGrid,
    cluster: ResourceCluster,
    config: ClusterConfig,
  ): void {
    const callbacks: FloodFillCallbacks<any> = {
      isInBounds: (position: Vector2) => terrain.isInBounds(position),
      canModify: (position: Vector2) => terrain.canModify(position),
      setCell: (position: Vector2, value: any) => terrain.setCell(position, value),
      getCell: (position: Vector2) => terrain.getCell(position),
    };

    floodFill({
      center: cluster.position,
      value: cluster.type,
      config: {
        radius: cluster.radius,
        density: config.density,
      },
      callbacks,
    });
  }
}
