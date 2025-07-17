import {
  MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import {
  ResourceGenerationRules, ResourceGenerationConfig,
} from './resource-generation.rules';
import {
  ResourceType, ZoneType, TerrainType,
} from './types';
import { ResourcePlacer } from '../lib/resource-placer';
import { TerrainGridAdapter } from '../lib/terrain-grid.adapter';

export interface ResourceGenerationParams {
  terrainData: TerrainType[][];
  spawnPoints: SpawnPoint[];
  size: MapSize;
  playersCount: number;
  config?: Partial<ResourceGenerationConfig>;
}

export class MapResourceGenerator {
  private readonly rules: ResourceGenerationRules;

  constructor(config: Partial<ResourceGenerationConfig> = {}) {
    this.rules = new ResourceGenerationRules(config);
  }

  public generateZonedResourceDeposits(params: ResourceGenerationParams): void {
    const needs = this.rules.calculateResourceNeeds(params.size, params.playersCount);
    const zones = this.rules.calculateResourceZones(params.size);

    const terrain = new TerrainGridAdapter(params.terrainData, params.size);
    const spawnPositions = params.spawnPoints.map(sp => sp.toJSON());
    const placedClusters: any[] = [];

    this.placeResourceType(
      ResourceType.Crystal,
      needs.crystalsInCentralZone,
      terrain,
      zones,
      spawnPositions,
      placedClusters,
    );

    this.placeResourceType(
      ResourceType.Gold,
      needs.totalGold,
      terrain,
      zones,
      spawnPositions,
      placedClusters,
    );

    this.placeResourceType(
      ResourceType.Iron,
      needs.ironInOuterZone,
      terrain,
      zones,
      spawnPositions,
      placedClusters,
    );
  }

  public placeGuaranteedSpawnResources(params: ResourceGenerationParams): void {
    const terrain = new TerrainGridAdapter(params.terrainData, params.size);
    const spawnPositions = params.spawnPoints.map(sp => sp.toJSON());
    const spawnConfig = this.rules.getSpawnResourceConfig();

    const resourceTypeNames = spawnConfig.types.map(type => this.rules.getTerrainType(type));

    ResourcePlacer.placeGuaranteedSpawnResources(
      terrain,
      spawnPositions,
      resourceTypeNames,
      spawnConfig.clusterConfig,
      spawnConfig.minDistance,
      spawnConfig.maxDistance,
    );
  }

  private placeResourceType(
    resourceType: ResourceType,
    count: number,
    terrain: TerrainGridAdapter,
    zones: any,
    spawnPositions: any[],
    placedClusters: any[],
  ): void {
    if (count <= 0) return;

    const constraints = this.rules.getPlacementConstraints(resourceType);
    const terrainType = this.rules.getTerrainType(resourceType);

    for (const zoneType of constraints.allowedZones) {
      const clusterConfig = this.rules.getClusterConfig(resourceType, zoneType);
      let countForZone = count;

      if (resourceType === ResourceType.Gold) {
        if (zoneType === ZoneType.Central) {
          const mapSize = new MapSize(terrain.width, terrain.height);
          const needs = this.rules.calculateResourceNeeds(mapSize, 2);

          countForZone = needs.goldInCentralZone;
        } else if (zoneType === ZoneType.Middle) {
          const mapSize = new MapSize(terrain.width, terrain.height);
          const needs = this.rules.calculateResourceNeeds(mapSize, 2);

          countForZone = needs.goldInMiddleZone;
        } else {
          continue;
        }
      }

      const result = ResourcePlacer.placeResourceClusters(
        terrain,
        zones,
        {
          allowedZones: [zoneType],
          minDistanceFromOtherTypes: constraints.minDistanceFromOtherTypes,
          minDistanceFromSameType: constraints.minDistanceFromSameType,
          exclusionRadiusFromSpawns: constraints.exclusionRadiusFromSpawns,
          getDistanceFor: constraints.getDistanceFor.bind(constraints),
        },
        clusterConfig,
        terrainType,
        countForZone,
        spawnPositions,
        placedClusters,
      );

      placedClusters.push(...result.clustersPlaced);
    }
  }
}
