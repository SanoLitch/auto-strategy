import {
  Uuid, MapSize, SpawnPoint,
} from '@libs/domain-primitives';

export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
}

export class Map {
  public readonly id: Uuid;
  public readonly size: MapSize;
  public terrainData: TerrainType[][];
  public spawnPoints: SpawnPoint[];

  constructor(params: {
    id: Uuid;
    size: MapSize;
    terrainData?: TerrainType[][];
    spawnPoints?: SpawnPoint[];
  }) {
    this.id = params.id;
    this.size = params.size;
    this.terrainData = params.terrainData ?? [];
    this.spawnPoints = params.spawnPoints ?? [];
  }

  public generateTerrain(): void {
    const types = [
      TerrainType.Dirt,
      TerrainType.Rock,
      TerrainType.Bedrock,
    ];

    this.terrainData = Array.from({ length: this.size.y }, () =>
      Array.from({ length: this.size.x }, () =>
        types[Math.floor(Math.random() * types.length)] as TerrainType));
  }

  public generateSpawnPoints(playersCount: number): void {
    const points: SpawnPoint[] = [];

    if (playersCount >= 1) points.push(new SpawnPoint(1, 1));
    if (playersCount >= 2) points.push(new SpawnPoint(this.size.x - 2, this.size.y - 2));
    if (playersCount >= 3) points.push(new SpawnPoint(1, this.size.y - 2));
    if (playersCount >= 4) points.push(new SpawnPoint(this.size.x - 2, 1));

    this.spawnPoints = points;
  }
}
