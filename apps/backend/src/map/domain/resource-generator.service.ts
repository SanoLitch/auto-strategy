import {
  MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import { Vector2 } from '@libs/utils';
import {
  maxDistanceFromCenter,
  floodFill, FloodFillCallbacks,
  findValidPosition, createExclusionZones,
  type PlacementZone, type PlacementObject,
  type ExclusionZone, type PlacementCallbacks,
} from '@libs/map-generation';
import { TerrainType } from './types';

export interface ResourceGenerationConfig {
  baseResourceDensity: number;
  playerMultiplier: number;
  centralZoneRadiusPercent: number;
  middleZoneRadiusPercent: number;
}

export class MapResourceGenerator {
  private readonly defaultConfig: ResourceGenerationConfig = {
    baseResourceDensity: 0.025,
    playerMultiplier: 1.3,
    centralZoneRadiusPercent: 0.4,
    middleZoneRadiusPercent: 0.7,
  };

  public generateZonedResourceDeposits(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
    playersCount: number,
    config: Partial<ResourceGenerationConfig> = {},
  ): void {
    const finalConfig = {
      ...this.defaultConfig,
      ...config,
    };
    const mapArea = size.x * size.y;
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);
    const maxDistanceToCorner = maxDistanceFromCenter(size.x, size.y);

    const zones = this.calculateResourceZones(
      centerX,
      centerY,
      maxDistanceToCorner,
      finalConfig,
    );

    const resourceCounts = this.calculateResourceCounts(
      mapArea,
      playersCount,
      finalConfig,
    );

    this.placeZonedResourceClusters(
      terrainData,
      spawnPoints,
      size,
      zones,
      resourceCounts,
    );
  }

  public placeGuaranteedSpawnResources(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
  ): void {
    for (const spawnPoint of spawnPoints) {
      const spawnData = spawnPoint.toJSON();

      this.placeResourcesNearSpawn(terrainData, spawnData.x, spawnData.y, size);
    }
  }

  private calculateResourceZones(
    centerX: number,
    centerY: number,
    maxDistance: number,
    config: ResourceGenerationConfig,
  ) {
    return {
      centerX,
      centerY,
      centralZoneRadius: maxDistance * config.centralZoneRadiusPercent,
      middleZoneRadius: maxDistance * config.middleZoneRadiusPercent,
      maxDistance,
    };
  }

  private calculateResourceCounts(
    mapArea: number,
    playersCount: number,
    config: ResourceGenerationConfig,
  ) {
    const totalGoldClusters = Math.floor(
      mapArea * config.baseResourceDensity * Math.pow(config.playerMultiplier, Math.max(0, playersCount - 2)),
    );

    return {
      gold: totalGoldClusters,
      iron: Math.floor(totalGoldClusters * 0.8),
      crystal: Math.floor(totalGoldClusters * 0.3),
    };
  }

  private placeZonedResourceClusters(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
    zones: any,
    resourceCounts: any,
  ): void {
    const placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }> = [];
    const minDistanceBetweenSameType = 8;
    const minDistanceBetweenDifferentTypes = 15;

    this.placeCrystalsInCentralZone(
      terrainData,
      spawnPoints,
      size,
      resourceCounts.crystal,
      zones,
      placedClusters,
      minDistanceBetweenDifferentTypes,
    );

    this.placeGoldInZones(
      terrainData,
      spawnPoints,
      size,
      resourceCounts.gold,
      zones,
      placedClusters,
      minDistanceBetweenSameType,
      minDistanceBetweenDifferentTypes,
    );

    this.placeIronInOuterZones(
      terrainData,
      spawnPoints,
      size,
      resourceCounts.iron,
      zones,
      placedClusters,
      minDistanceBetweenSameType,
      minDistanceBetweenDifferentTypes,
    );
  }

  private placeCrystalsInCentralZone(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
    count: number,
    zones: any,
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistance: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const position = this.findValidPositionInZone(
        spawnPoints,
        size,
        zones.centerX,
        zones.centerY,
        0,
        zones.centralZoneRadius,
        placedClusters,
        minDistance,
        TerrainType.CrystalCluster,
      );

      if (position) {
        const radius = 3 + Math.floor(Math.random() * 4);

        placedClusters.push({
          ...position,
          type: TerrainType.CrystalCluster,
          radius,
        });
        this.generateContiguousResourceCluster(
          terrainData,
          size,
          position.x,
          position.y,
          TerrainType.CrystalCluster,
          {
            radius,
            density: 0.95,
          },
        );
      }
    }
  }

  private placeGoldInZones(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
    count: number,
    zones: any,
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistanceSame: number,
    minDistanceDifferent: number,
  ): void {
    const centralGoldCount = Math.floor(count * 0.4);
    const middleGoldCount = count - centralGoldCount;

    for (let i = 0; i < centralGoldCount; i++) {
      const position = this.findValidPositionInZone(
        spawnPoints,
        size,
        zones.centerX,
        zones.centerY,
        0,
        zones.centralZoneRadius,
        placedClusters,
        minDistanceDifferent,
        TerrainType.GoldCluster,
      );

      if (position) {
        const radius = 4 + Math.floor(Math.random() * 4);

        placedClusters.push({
          ...position,
          type: TerrainType.GoldCluster,
          radius,
        });
        this.generateContiguousResourceCluster(
          terrainData,
          size,
          position.x,
          position.y,
          TerrainType.GoldCluster,
          {
            radius,
            density: 0.85,
          },
        );
      }
    }

    for (let i = 0; i < middleGoldCount; i++) {
      const position = this.findValidPositionInZone(
        spawnPoints,
        size,
        zones.centerX,
        zones.centerY,
        zones.centralZoneRadius,
        zones.middleZoneRadius,
        placedClusters,
        minDistanceSame,
        TerrainType.GoldCluster,
      );

      if (position) {
        const radius = 2 + Math.floor(Math.random() * 4);

        placedClusters.push({
          ...position,
          type: TerrainType.GoldCluster,
          radius,
        });
        this.generateContiguousResourceCluster(
          terrainData,
          size,
          position.x,
          position.y,
          TerrainType.GoldCluster,
          {
            radius,
            density: 0.75,
          },
        );
      }
    }
  }

  private placeIronInOuterZones(
    terrainData: TerrainType[][],
    spawnPoints: SpawnPoint[],
    size: MapSize,
    count: number,
    zones: any,
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistanceSame: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const position = this.findValidPositionInZone(
        spawnPoints,
        size,
        zones.centerX,
        zones.centerY,
        zones.centralZoneRadius,
        zones.maxDistance,
        placedClusters,
        minDistanceSame,
        TerrainType.IronCluster,
      );

      if (position) {
        const radius = 3 + Math.floor(Math.random() * 5);

        placedClusters.push({
          ...position,
          type: TerrainType.IronCluster,
          radius,
        });
        this.generateContiguousResourceCluster(
          terrainData,
          size,
          position.x,
          position.y,
          TerrainType.IronCluster,
          {
            radius,
            density: 0.70,
          },
        );
      }
    }
  }

  private findValidPositionInZone(
    spawnPoints: SpawnPoint[],
    size: MapSize,
    centerX: number,
    centerY: number,
    minRadius: number,
    maxRadius: number,
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistance: number,
    resourceType: TerrainType,
  ): { x: number; y: number } | null {
    const zone: PlacementZone = {
      center: {
        x: centerX,
        y: centerY,
      },
      minRadius,
      maxRadius,
    };

    const existingObjects: PlacementObject[] = placedClusters.map(cluster => ({
      position: {
        x: cluster.x,
        y: cluster.y,
      },
      type: cluster.type,
      radius: cluster.radius,
    }));

    const spawnPointsData = spawnPoints.map(sp => sp.toJSON());
    const exclusionZones: ExclusionZone[] = createExclusionZones(spawnPointsData, 12);

    const callbacks: PlacementCallbacks = {
      isInBounds: (position: Vector2) =>
        position.x >= 0 && position.x < size.x && position.y >= 0 && position.y < size.y,
    };

    const result = findValidPosition({
      zone,
      objectType: resourceType,
      existingObjects,
      exclusionZones,
      minDistance,
      differentTypeDistanceMultiplier: 1.5,
      edgeMargin: 5,
      maxAttempts: 200,
    }, callbacks);

    return result.success ? result.position : null;
  }

  private generateContiguousResourceCluster(
    terrainData: TerrainType[][],
    size: MapSize,
    centerX: number,
    centerY: number,
    resourceType: TerrainType,
    config: { radius: number; density: number },
  ): void {
    const callbacks: FloodFillCallbacks<TerrainType> = {
      isInBounds: (position: Vector2) =>
        position.x >= 0 && position.x < size.x && position.y >= 0 && position.y < size.y,
      canModify: (position: Vector2) => terrainData[position.y][position.x] !== TerrainType.Bedrock,
      setCell: (position: Vector2, value: TerrainType) => { terrainData[position.y][position.x] = value; },
      getCell: (position: Vector2) => terrainData[position.y][position.x],
    };

    floodFill({
      center: {
        x: centerX,
        y: centerY,
      },
      value: resourceType,
      config: {
        radius: config.radius,
        density: config.density,
      },
      callbacks,
    });
  }

  private placeResourcesNearSpawn(
    terrainData: TerrainType[][],
    spawnX: number,
    spawnY: number,
    size: MapSize,
  ): void {
    const minDistance = 4;
    const maxDistance = 8;

    const ironAngle = Math.random() * 2 * Math.PI;
    const ironDistance = minDistance + 2 + Math.random() * (maxDistance - minDistance - 2);
    const ironX = Math.floor(spawnX + Math.cos(ironAngle) * ironDistance);
    const ironY = Math.floor(spawnY + Math.sin(ironAngle) * ironDistance);

    if (ironX >= 0 && ironX < size.x && ironY >= 0 && ironY < size.y) {
      this.generateContiguousResourceCluster(
        terrainData,
        size,
        ironX,
        ironY,
        TerrainType.IronCluster,
        {
          radius: 2,
          density: 0.8,
        },
      );
    }

    const goldAngle = ironAngle + Math.PI + (Math.random() - 0.5) * Math.PI;
    const goldDistance = minDistance + 2 + Math.random() * (maxDistance - minDistance - 2);
    const goldX = Math.floor(spawnX + Math.cos(goldAngle) * goldDistance);
    const goldY = Math.floor(spawnY + Math.sin(goldAngle) * goldDistance);

    if (goldX >= 0 && goldX < size.x && goldY >= 0 && goldY < size.y) {
      this.generateContiguousResourceCluster(
        terrainData,
        size,
        goldX,
        goldY,
        TerrainType.GoldCluster,
        {
          radius: 2,
          density: 0.8,
        },
      );
    }
  }
}
