import { Vector2 } from '@libs/utils';

// Существующие типы
export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
  Empty = 'Empty',
  GoldCluster = 'GoldCluster',
  CrystalCluster = 'CrystalCluster',
  IronCluster = 'IronCluster',
}

// === VALUE OBJECTS ДЛЯ ГЕНЕРАЦИИ РЕСУРСОВ ===

export enum ZoneType {
  Central = 'central',
  Middle = 'middle',
  Outer = 'outer',
}

export enum ResourceType {
  Gold = 'gold',
  Iron = 'iron',
  Crystal = 'crystal',
}

export class ResourceNeeds {
  public readonly crystalsInCentralZone: number;
  public readonly goldInCentralZone: number;
  public readonly goldInMiddleZone: number;
  public readonly ironInOuterZone: number;
  public readonly guaranteedPerSpawn: { iron: number; gold: number };

  constructor(data: {
    crystalsInCentralZone: number;
    goldInCentralZone: number;
    goldInMiddleZone: number;
    ironInOuterZone: number;
    guaranteedPerSpawn: { iron: number; gold: number };
  }) {
    this.crystalsInCentralZone = data.crystalsInCentralZone;
    this.goldInCentralZone = data.goldInCentralZone;
    this.goldInMiddleZone = data.goldInMiddleZone;
    this.ironInOuterZone = data.ironInOuterZone;
    this.guaranteedPerSpawn = { ...data.guaranteedPerSpawn };
  }

  public get totalGold(): number {
    return this.goldInCentralZone + this.goldInMiddleZone;
  }
}

export class PlacementConstraints {
  public readonly allowedZones: readonly ZoneType[];
  public readonly minDistanceFromOtherTypes: number;
  public readonly minDistanceFromSameType: number;
  public readonly exclusionRadiusFromSpawns: number;

  constructor(data: {
    allowedZones: ZoneType[];
    minDistanceFromOtherTypes: number;
    minDistanceFromSameType: number;
    exclusionRadiusFromSpawns: number;
  }) {
    this.allowedZones = Object.freeze([...data.allowedZones]);
    this.minDistanceFromOtherTypes = data.minDistanceFromOtherTypes;
    this.minDistanceFromSameType = data.minDistanceFromSameType;
    this.exclusionRadiusFromSpawns = data.exclusionRadiusFromSpawns;
  }

  public getDistanceFor(resourceType: ResourceType, otherResourceType: ResourceType): number {
    return resourceType === otherResourceType
      ? this.minDistanceFromSameType
      : this.minDistanceFromOtherTypes;
  }
}

export class ClusterConfig {
  public readonly minRadius: number;
  public readonly maxRadius: number;
  public readonly density: number;

  constructor(data: {
    minRadius: number;
    maxRadius: number;
    density: number;
  }) {
    this.minRadius = data.minRadius;
    this.maxRadius = data.maxRadius;
    this.density = data.density;
  }

  public generateRadius(): number {
    return this.minRadius + Math.floor(Math.random() * (this.maxRadius - this.minRadius + 1));
  }
}

export class ResourceZones {
  public readonly central: { center: Vector2; minRadius: number; maxRadius: number };
  public readonly middle: { center: Vector2; minRadius: number; maxRadius: number };
  public readonly outer: { center: Vector2; minRadius: number; maxRadius: number };

  constructor(data: {
    central: { center: Vector2; minRadius: number; maxRadius: number };
    middle: { center: Vector2; minRadius: number; maxRadius: number };
    outer: { center: Vector2; minRadius: number; maxRadius: number };
  }) {
    this.central = {
      ...data.central,
      center: { ...data.central.center },
    };
    this.middle = {
      ...data.middle,
      center: { ...data.middle.center },
    };
    this.outer = {
      ...data.outer,
      center: { ...data.outer.center },
    };
  }

  public getZone(zoneType: ZoneType): { center: Vector2; minRadius: number; maxRadius: number } {
    switch (zoneType) {
    case ZoneType.Central:
      return this.central;
    case ZoneType.Middle:
      return this.middle;
    case ZoneType.Outer:
      return this.outer;
    default:
      throw new Error(`Unknown zone type: ${ zoneType }`);
    }
  }
}
