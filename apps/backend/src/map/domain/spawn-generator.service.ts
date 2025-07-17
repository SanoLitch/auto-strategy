import {
  MapSize, SpawnPoint,
} from '@libs/domain-primitives';

export class MapSpawnGenerator {
  public calculateSpawnPoints(size: MapSize, playersCount: number): SpawnPoint[] {
    if (playersCount === 0) {
      return [];
    }
    const margin = 10;
    const minDistance = Math.min(size.x, size.y) / 3;

    if (playersCount === 1) {
      return [
        new SpawnPoint(
          Math.floor(size.x / 2),
          Math.floor(size.y / 2),
        ),
      ];
    }
    const positions = this.calculateSpawnPositions(size, playersCount, margin);

    return positions.map(pos => new SpawnPoint(pos.x, pos.y));
  }

  private calculateSpawnPositions(
    size: MapSize,
    playersCount: number,
    margin: number,
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    const cornerPositions = [
      {
        x: margin,
        y: margin,
      },
      {
        x: size.x - margin,
        y: margin,
      },
      {
        x: margin,
        y: size.y - margin,
      },
      {
        x: size.x - margin,
        y: size.y - margin,
      },
    ];

    if (playersCount === 2) {
      positions.push(cornerPositions[0], cornerPositions[3]);
    } else if (playersCount <= 4) {
      for (let i = 0; i < playersCount; i++) {
        positions.push(cornerPositions[i]);
      }
    } else {
      positions.push(...cornerPositions);
      const additionalCount = playersCount - 4;
      const edgePositions = this.generateEdgePositions(size, additionalCount, margin);

      positions.push(...edgePositions);
    }

    return positions.slice(0, playersCount);
  }

  private generateEdgePositions(
    size: MapSize,
    count: number,
    margin: number,
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    const edgePositions = [
      {
        x: Math.floor(size.x / 2),
        y: margin,
      },
      {
        x: Math.floor(size.x / 2),
        y: size.y - margin,
      },
      {
        x: margin,
        y: Math.floor(size.y / 2),
      },
      {
        x: size.x - margin,
        y: Math.floor(size.y / 2),
      },
    ];

    for (let i = 0; i < Math.min(count, edgePositions.length); i++) {
      positions.push(edgePositions[i]);
    }

    return positions;
  }
}
