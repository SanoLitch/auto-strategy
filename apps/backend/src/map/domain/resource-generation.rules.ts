import { MapSize } from '@libs/domain-primitives';
import { maxDistanceFromCenter } from '@libs/utils';
import {
  ResourceNeeds,
  PlacementConstraints,
  ClusterConfig,
  ResourceZones,
  ResourceType,
  ZoneType,
  TerrainType,
} from './types';

export interface ResourceGenerationConfig {
  baseResourceDensity: number;
  playerMultiplier: number;
  centralZoneRadiusPercent: number;
  middleZoneRadiusPercent: number;
}

export class ResourceGenerationRules {
  private readonly defaultConfig: ResourceGenerationConfig = {
    baseResourceDensity: 0.025,
    playerMultiplier: 1.3,
    centralZoneRadiusPercent: 0.4,
    middleZoneRadiusPercent: 0.7,
  };

  constructor(private readonly config: Partial<ResourceGenerationConfig> = {}) { }

  public calculateResourceNeeds(mapSize: MapSize, playerCount: number): ResourceNeeds {
    const finalConfig = {
      ...this.defaultConfig,
      ...this.config,
    };
    const mapArea = mapSize.x * mapSize.y;

    const goldTotal = Math.floor(
      mapArea
      * finalConfig.baseResourceDensity
      * Math.pow(finalConfig.playerMultiplier, Math.max(0, playerCount - 2)),
    );

    const crystals = Math.floor(goldTotal * 0.3);
    const iron = Math.floor(goldTotal * 0.8);

    const goldCentral = Math.floor(goldTotal * 0.4);
    const goldMiddle = goldTotal - goldCentral;

    return new ResourceNeeds({
      crystalsInCentralZone: crystals,
      goldInCentralZone: goldCentral,
      goldInMiddleZone: goldMiddle,
      ironInOuterZone: iron,
      guaranteedPerSpawn: {
        iron: 1,
        gold: 1,
      },
    });
  }

  public calculateResourceZones(mapSize: MapSize): ResourceZones {
    const finalConfig = {
      ...this.defaultConfig,
      ...this.config,
    };
    const centerX = Math.floor(mapSize.x / 2);
    const centerY = Math.floor(mapSize.y / 2);
    const maxDistance = maxDistanceFromCenter(mapSize.x, mapSize.y);

    const centralRadius = maxDistance * finalConfig.centralZoneRadiusPercent;
    const middleRadius = maxDistance * finalConfig.middleZoneRadiusPercent;

    return new ResourceZones({
      central: {
        center: {
          x: centerX,
          y: centerY,
        },
        minRadius: 0,
        maxRadius: centralRadius,
      },
      middle: {
        center: {
          x: centerX,
          y: centerY,
        },
        minRadius: centralRadius,
        maxRadius: middleRadius,
      },
      outer: {
        center: {
          x: centerX,
          y: centerY,
        },
        minRadius: centralRadius,
        maxRadius: maxDistance,
      },
    });
  }

  public getPlacementConstraints(resourceType: ResourceType): PlacementConstraints {
    switch (resourceType) {
      case ResourceType.Crystal:
        return new PlacementConstraints({
          allowedZones: [ZoneType.Central],
          minDistanceFromOtherTypes: 15,
          minDistanceFromSameType: 8,
          exclusionRadiusFromSpawns: 12,
        });

      case ResourceType.Gold:
        return new PlacementConstraints({
          allowedZones: [ZoneType.Central, ZoneType.Middle],
          minDistanceFromOtherTypes: 15,
          minDistanceFromSameType: 8,
          exclusionRadiusFromSpawns: 12,
        });

      case ResourceType.Iron:
        return new PlacementConstraints({
          allowedZones: [ZoneType.Outer],
          minDistanceFromOtherTypes: 15,
          minDistanceFromSameType: 8,
          exclusionRadiusFromSpawns: 12,
        });

      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }
  }

  public getClusterConfig(resourceType: ResourceType, zone?: ZoneType): ClusterConfig {
    switch (resourceType) {
      case ResourceType.Crystal:
        return new ClusterConfig({
          minRadius: 3,
          maxRadius: 6,
          density: 0.95,
        });

      case ResourceType.Gold:
        if (zone === ZoneType.Central) {
          return new ClusterConfig({
            minRadius: 4,
            maxRadius: 7,
            density: 0.85,
          });
        } else {
          return new ClusterConfig({
            minRadius: 2,
            maxRadius: 5,
            density: 0.75,
          });
        }

      case ResourceType.Iron:
        return new ClusterConfig({
          minRadius: 3,
          maxRadius: 7,
          density: 0.70,
        });

      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }
  }

  public getSpawnResourceConfig(): {
    types: ResourceType[];
    minDistance: number;
    maxDistance: number;
    clusterConfig: ClusterConfig;
  } {
    return {
      types: [ResourceType.Iron, ResourceType.Gold],
      minDistance: 4,
      maxDistance: 8,
      clusterConfig: new ClusterConfig({
        minRadius: 2,
        maxRadius: 2,
        density: 0.8,
      }),
    };
  }

  public getTerrainType(resourceType: ResourceType): TerrainType {
    switch (resourceType) {
      case ResourceType.Crystal:
        return TerrainType.CrystalCluster;
      case ResourceType.Gold:
        return TerrainType.GoldCluster;
      case ResourceType.Iron:
        return TerrainType.IronCluster;
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }
  }
}
