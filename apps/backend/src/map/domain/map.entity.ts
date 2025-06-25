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
    this.terrainData = Array.from({ length: this.size.y }, () =>
      Array.from({ length: this.size.x }, () => TerrainType.Dirt));

    this.generateTerrainLayers();
    this.generateBedrockFormations();
    this.addRockVariations();
    this.ensureSpawnAccessibility();
  }

  private generateTerrainLayers(): void {
    const centerX = Math.floor(this.size.x / 2);
    const centerY = Math.floor(this.size.y / 2);

    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const distanceFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
        );
        const maxDistance = Math.sqrt(
          Math.pow(centerX, 2) + Math.pow(centerY, 2),
        );

        const normalizedDistance = distanceFromCenter / maxDistance;

        const rockProbability = normalizedDistance * 0.4;
        const bedrockProbability = (1 - normalizedDistance) * 0.15;

        const random = Math.random();

        if (random < bedrockProbability) {
          this.terrainData[y][x] = TerrainType.Bedrock;
        } else if (random < bedrockProbability + rockProbability) {
          this.terrainData[y][x] = TerrainType.Rock;
        }
      }
    }
  }

  private generateBedrockFormations(): void {
    const formationCount = Math.floor((this.size.x * this.size.y) / 800);

    for (let i = 0; i < formationCount; i++) {
      const centerX = Math.floor(Math.random() * this.size.x);
      const centerY = Math.floor(Math.random() * this.size.y);
      const radius = 2 + Math.floor(Math.random() * 4);

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x = centerX + dx;
          const y = centerY + dy;

          if (x >= 0 && x < this.size.x && y >= 0 && y < this.size.y) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            const probability = Math.max(0, 1 - distance / radius);

            if (Math.random() < probability * 0.8) {
              this.terrainData[y][x] = TerrainType.Bedrock;
            }
          }
        }
      }
    }
  }

  private addRockVariations(): void {
    const veinCount = Math.floor((this.size.x * this.size.y) / 400); // ~1 жила на 400 клеток

    for (let i = 0; i < veinCount; i++) {
      const startX = Math.floor(Math.random() * this.size.x);
      const startY = Math.floor(Math.random() * this.size.y);
      const length = 5 + Math.floor(Math.random() * 10);
      const direction = Math.random() * 2 * Math.PI;

      for (let j = 0; j < length; j++) {
        const x = Math.floor(startX + Math.cos(direction) * j);
        const y = Math.floor(startY + Math.sin(direction) * j);

        if (x >= 0 && x < this.size.x && y >= 0 && y < this.size.y) {
          const noise = (Math.random() - 0.5) * 2;
          const thickness = 1 + Math.floor(Math.random() * 2);

          for (let dy = -thickness; dy <= thickness; dy++) {
            for (let dx = -thickness; dx <= thickness; dx++) {
              const nx = x + dx + Math.floor(noise);
              const ny = y + dy + Math.floor(noise);

              if (nx >= 0 && nx < this.size.x && ny >= 0 && ny < this.size.y) {
                if (this.terrainData[ny][nx] === TerrainType.Dirt && Math.random() < 0.7) {
                  this.terrainData[ny][nx] = TerrainType.Rock;
                }
              }
            }
          }
        }
      }
    }
  }

  private ensureSpawnAccessibility(): void {
    for (const spawnPoint of this.spawnPoints) {
      const spawnX = spawnPoint.toJSON().x;
      const spawnY = spawnPoint.toJSON().y;
      const clearRadius = 3;

      for (let dy = -clearRadius; dy <= clearRadius; dy++) {
        for (let dx = -clearRadius; dx <= clearRadius; dx++) {
          const x = spawnX + dx;
          const y = spawnY + dy;

          if (x >= 0 && x < this.size.x && y >= 0 && y < this.size.y) {
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= clearRadius) {
              if (distance <= 1) {
                this.terrainData[y][x] = TerrainType.Dirt;
              } else if (distance <= 2 && this.terrainData[y][x] === TerrainType.Bedrock) {
                this.terrainData[y][x] = TerrainType.Rock;
              }
            }
          }
        }
      }
    }
  }

  public generateSpawnPoints(playersCount: number): void {
    const points: SpawnPoint[] = [];
    const centerX = Math.floor(this.size.x / 2);
    const centerY = Math.floor(this.size.y / 2);
    const spawnRadius = Math.min(this.size.x, this.size.y) * 0.35;
    const minDistanceFromEdge = 5;

    for (let i = 0; i < playersCount; i++) {
      const angle = (2 * Math.PI * i) / playersCount;

      let x = Math.floor(centerX + Math.cos(angle) * spawnRadius);
      let y = Math.floor(centerY + Math.sin(angle) * spawnRadius);

      x = Math.max(minDistanceFromEdge, Math.min(this.size.x - minDistanceFromEdge, x));
      y = Math.max(minDistanceFromEdge, Math.min(this.size.y - minDistanceFromEdge, y));

      const randomOffsetX = (Math.random() - 0.5) * 4;
      const randomOffsetY = (Math.random() - 0.5) * 4;

      x = Math.floor(Math.max(
        minDistanceFromEdge,
        Math.min(this.size.x - minDistanceFromEdge, x + randomOffsetX),
      ));
      y = Math.floor(Math.max(
        minDistanceFromEdge,
        Math.min(this.size.y - minDistanceFromEdge, y + randomOffsetY),
      ));
      points.push(new SpawnPoint(x, y));
    }
    this.spawnPoints = points;
  }
}
