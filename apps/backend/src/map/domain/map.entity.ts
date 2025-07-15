import {
  Uuid, MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import {
  euclideanDistance, distanceFromCenter, maxDistanceFromCenter,
} from '@libs/map-generation';

export enum TerrainType {
  Dirt = 'Dirt',
  Rock = 'Rock',
  Bedrock = 'Bedrock',
  Empty = 'Empty',
  GoldCluster = 'GoldCluster',
  CrystalCluster = 'CrystalCluster',
  IronCluster = 'IronCluster',
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

  public generateTerrainWithResources(playersCount: number): void {
    this.generateTerrain();
    this.generateZonedResourceDeposits(playersCount);
    this.ensureSpawnAccessibilityWithResources();
  }

  private generateZonedResourceDeposits(playersCount: number): void {
    const mapArea = this.size.x * this.size.y;
    const centerX = Math.floor(this.size.x / 2);
    const centerY = Math.floor(this.size.y / 2);
    const maxDistanceToCorner = maxDistanceFromCenter(this.size.x, this.size.y);

    // Определение зон карты
    const centralZoneRadius = maxDistanceToCorner * 0.4; // 40% от края до центра
    const middleZoneRadius = maxDistanceToCorner * 0.7; // 70% от края до центра

    // Расчет базового количества ресурсов
    const baseResourceDensity = 0.025; // Немного меньше для более качественных кластеров
    const playerMultiplier = 1.3; // Увеличение за каждого игрока

    const totalGoldClusters = Math.floor(
      mapArea * baseResourceDensity * Math.pow(playerMultiplier, Math.max(0, playersCount - 2)),
    );
    const totalIronClusters = Math.floor(totalGoldClusters * 0.8); // 80% от золота
    const totalCrystalClusters = Math.floor(totalGoldClusters * 0.3); // 30% от золота, только в центре

    // Распределение ресурсов по зонам
    this.placeZonedResourceClusters(
      totalGoldClusters,
      totalIronClusters,
      totalCrystalClusters,
      {
        centerX,
        centerY,
        centralZoneRadius,
        middleZoneRadius,
        maxDistance: maxDistanceToCorner,
      },
    );
  }

  private placeZonedResourceClusters(
    goldCount: number,
    ironCount: number,
    crystalCount: number,
    zones: {
      centerX: number;
      centerY: number;
      centralZoneRadius: number;
      middleZoneRadius: number;
      maxDistance: number;
    },
  ): void {
    const placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }> = [];
    const minDistanceBetweenSameType = 8;
    const minDistanceBetweenDifferentTypes = 15; // Увеличенное расстояние между разными типами

    // 1. Размещаем кристаллы только в центральной зоне (самые богатые)
    this.placeCrystalsInCentralZone(
      crystalCount,
      zones,
      placedClusters,
      minDistanceBetweenDifferentTypes,
    );

    // 2. Размещаем золото в центральной и средней зонах (центральные богаче)
    this.placeGoldInZones(
      goldCount,
      zones,
      placedClusters,
      minDistanceBetweenSameType,
      minDistanceBetweenDifferentTypes,
    );

    // 3. Размещаем железо везде кроме центральной зоны
    this.placeIronInOuterZones(
      ironCount,
      zones,
      placedClusters,
      minDistanceBetweenSameType,
      minDistanceBetweenDifferentTypes,
    );
  }

  private placeCrystalsInCentralZone(
    count: number,
    zones: { centerX: number; centerY: number; centralZoneRadius: number },
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistance: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const position = this.findValidPositionInZone(
        zones.centerX,
        zones.centerY,
        0,
        zones.centralZoneRadius,
        placedClusters,
        minDistance,
        TerrainType.CrystalCluster,
      );

      if (position) {
        // Кристаллы в центре крупнее и плотнее
        const radius = 3 + Math.floor(Math.random() * 4); // 3-6

        placedClusters.push({
          ...position,
          type: TerrainType.CrystalCluster,
          radius,
        });
        this.generateContiguousResourceCluster(position.x, position.y, TerrainType.CrystalCluster, {
          radius,
          density: 0.95, // Очень плотные
        });
      }
    }
  }

  private placeGoldInZones(
    count: number,
    zones: { centerX: number; centerY: number; centralZoneRadius: number; middleZoneRadius: number },
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistanceSame: number,
    minDistanceDifferent: number,
  ): void {
    const centralGoldCount = Math.floor(count * 0.4); // 40% в центре
    const middleGoldCount = count - centralGoldCount; // 60% в средней зоне

    // Золото в центральной зоне (богаче)
    for (let i = 0; i < centralGoldCount; i++) {
      const position = this.findValidPositionInZone(
        zones.centerX,
        zones.centerY,
        0,
        zones.centralZoneRadius,
        placedClusters,
        minDistanceDifferent,
        TerrainType.GoldCluster,
      );

      if (position) {
        const radius = 4 + Math.floor(Math.random() * 4); // 4-7

        placedClusters.push({
          ...position,
          type: TerrainType.GoldCluster,
          radius,
        });
        this.generateContiguousResourceCluster(position.x, position.y, TerrainType.GoldCluster, {
          radius,
          density: 0.85,
        });
      }
    }

    // Золото в средней зоне
    for (let i = 0; i < middleGoldCount; i++) {
      const position = this.findValidPositionInZone(
        zones.centerX,
        zones.centerY,
        zones.centralZoneRadius,
        zones.middleZoneRadius,
        placedClusters,
        minDistanceSame,
        TerrainType.GoldCluster,
      );

      if (position) {
        const radius = 2 + Math.floor(Math.random() * 4); // 2-5

        placedClusters.push({
          ...position,
          type: TerrainType.GoldCluster,
          radius,
        });
        this.generateContiguousResourceCluster(position.x, position.y, TerrainType.GoldCluster, {
          radius,
          density: 0.75,
        });
      }
    }
  }

  private placeIronInOuterZones(
    count: number,
    zones: { centerX: number; centerY: number; centralZoneRadius: number; maxDistance: number },
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistanceSame: number,
    minDistanceDifferent: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const position = this.findValidPositionInZone(
        zones.centerX,
        zones.centerY,
        zones.centralZoneRadius,
        zones.maxDistance,
        placedClusters,
        minDistanceSame,
        TerrainType.IronCluster,
      );

      if (position) {
        const radius = 3 + Math.floor(Math.random() * 5); // 3-7

        placedClusters.push({
          ...position,
          type: TerrainType.IronCluster,
          radius,
        });
        this.generateContiguousResourceCluster(position.x, position.y, TerrainType.IronCluster, {
          radius,
          density: 0.70,
        });
      }
    }
  }

  private findValidPositionInZone(
    centerX: number,
    centerY: number,
    minRadius: number,
    maxRadius: number,
    placedClusters: Array<{ x: number; y: number; type: TerrainType; radius: number }>,
    minDistance: number,
    resourceType: TerrainType,
  ): { x: number; y: number } | null {
    const spawnProtectedZone = 12; // Защищенная зона вокруг спавна

    for (let attempt = 0; attempt < 200; attempt++) {
      // Генерируем случайную позицию в кольце
      const angle = Math.random() * 2 * Math.PI;
      const distance = minRadius + Math.random() * (maxRadius - minRadius);

      const x = Math.floor(centerX + Math.cos(angle) * distance);
      const y = Math.floor(centerY + Math.sin(angle) * distance);

      // Проверяем границы карты
      if (x < 5 || x >= this.size.x - 5 || y < 5 || y >= this.size.y - 5) {
        continue;
      }

      // Проверяем расстояние от спавнов
      const tooCloseToSpawn = this.spawnPoints.some(spawnPoint => {
        const spawn = spawnPoint.toJSON();
        const distanceToSpawn = euclideanDistance(x, y, spawn.x, spawn.y);

        return distanceToSpawn < spawnProtectedZone;
      });

      if (tooCloseToSpawn) {
        continue;
      }

      // Проверяем расстояние от других кластеров
      const conflictingCluster = placedClusters.find(cluster => {
        const distanceToCluster = euclideanDistance(x, y, cluster.x, cluster.y);
        const requiredDistance = cluster.type === resourceType ? minDistance : minDistance * 1.5;

        return distanceToCluster < requiredDistance;
      });

      if (!conflictingCluster) {
        return {
          x,
          y,
        };
      }
    }

    return null;
  }

  private generateContiguousResourceCluster(
    centerX: number,
    centerY: number,
    resourceType: TerrainType,
    config: { radius: number; density: number },
  ): void {
    // Создаем неразрывную область используя алгоритм заливки с вероятностным расширением
    const visited = new Set<string>();
    const queue: Array<{ x: number; y: number; distance: number }> = [];

    queue.push({
      x: centerX,
      y: centerY,
      distance: 0,
    });
    visited.add(`${ centerX },${ centerY }`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const {
        x, y, distance,
      } = current;

      // Проверяем границы и возможность размещения
      if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
        continue;
      }

      // Не замещаем Bedrock
      if (this.terrainData[y][x] === TerrainType.Bedrock) {
        continue;
      }

      // Рассчитываем вероятность размещения ресурса
      const probability = this.calculateContiguousProbability(distance, config.radius, config.density);

      if (Math.random() < probability) {
        this.terrainData[y][x] = resourceType;

        // Добавляем соседние клетки в очередь, если расстояние позволяет
        if (distance < config.radius) {
          const directions = [
            {
              dx: -1,
              dy: 0,
            },
            {
              dx: 1,
              dy: 0,
            },
            {
              dx: 0,
              dy: -1,
            },
            {
              dx: 0,
              dy: 1,
            },
            {
              dx: -1,
              dy: -1,
            },
            {
              dx: 1,
              dy: -1,
            },
            {
              dx: -1,
              dy: 1,
            },
            {
              dx: 1,
              dy: 1,
            },
          ];

          for (const dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            const key = `${ newX },${ newY }`;

            if (!visited.has(key)) {
              visited.add(key);
              queue.push({
                x: newX,
                y: newY,
                distance: distance + 1,
              });
            }
          }
        }
      }
    }
  }

  private calculateContiguousProbability(distance: number, radius: number, baseDensity: number): number {
    if (distance === 0) return 1.0; // Центр всегда заполнен

    const normalizedDistance = distance / radius;
    const falloff = 1 - Math.pow(normalizedDistance, 0.8); // Более плавный спад
    const noise = (Math.random() - 0.5) * 0.1; // Меньше шума для более связных областей

    return Math.max(0, Math.min(1, baseDensity * falloff + noise));
  }

  private generateTerrainLayers(): void {
    const centerX = Math.floor(this.size.x / 2);
    const centerY = Math.floor(this.size.y / 2);

    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const currentDistanceFromCenter = distanceFromCenter(x, y, centerX, centerY);
        const maxDistance = maxDistanceFromCenter(this.size.x, this.size.y);

        const normalizedDistance = currentDistanceFromCenter / maxDistance;

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
            const distance = euclideanDistance(0, 0, dx, dy);
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
      const immediateRadius = 2; // Зона для немедленного строительства
      const clearRadius = 4; // Общая зона доступности

      for (let dy = -clearRadius; dy <= clearRadius; dy++) {
        for (let dx = -clearRadius; dx <= clearRadius; dx++) {
          const x = spawnX + dx;
          const y = spawnY + dy;

          if (x >= 0 && x < this.size.x && y >= 0 && y < this.size.y) {
            const distance = euclideanDistance(0, 0, dx, dy);

            if (distance <= immediateRadius) {
              // Ближайшая зона - сразу свободна для строительства
              this.terrainData[y][x] = TerrainType.Empty;
            } else if (distance <= clearRadius) {
              // Внешняя зона - убираем только неразрушимые блоки
              if (this.terrainData[y][x] === TerrainType.Bedrock) {
                this.terrainData[y][x] = TerrainType.Rock;
              }
              // Убираем ресурсы из стартовой зоны для баланса
              if (this.terrainData[y][x] === TerrainType.GoldCluster
                || this.terrainData[y][x] === TerrainType.CrystalCluster
                || this.terrainData[y][x] === TerrainType.IronCluster) {
                this.terrainData[y][x] = TerrainType.Dirt;
              }
            }
          }
        }
      }
    }
  }

  public generateSpawnPoints(playersCount: number): void {
    this.spawnPoints = [];

    if (playersCount === 0) return;

    const margin = 10;
    const minDistance = Math.min(this.size.x, this.size.y) / 3;

    if (playersCount === 1) {
      this.spawnPoints.push(new SpawnPoint(
        Math.floor(this.size.x / 2),
        Math.floor(this.size.y / 2),
      ));
      return;
    }

    // Размещение игроков по углам и краям карты
    const positions = this.calculateSpawnPositions(playersCount, margin, minDistance);

    for (const pos of positions) {
      this.spawnPoints.push(new SpawnPoint(pos.x, pos.y));
    }
  }

  private calculateSpawnPositions(
    playersCount: number,
    margin: number,
    minDistance: number,
  ): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];
    const centerX = this.size.x / 2;
    const centerY = this.size.y / 2;

    // Основные позиции по углам
    const cornerPositions = [
      {
        x: margin,
        y: margin,
      },
      {
        x: this.size.x - margin,
        y: margin,
      },
      {
        x: margin,
        y: this.size.y - margin,
      },
      {
        x: this.size.x - margin,
        y: this.size.y - margin,
      },
    ];

    // Если игроков 2, размещаем по диагонали
    if (playersCount === 2) {
      positions.push(cornerPositions[0], cornerPositions[3]);
      // Если игроков 3-4, используем углы
    } else if (playersCount <= 4) {
      for (let i = 0; i < playersCount; i++) {
        positions.push(cornerPositions[i]);
      }
    } else {
    // Если больше 4, добавляем позиции по краям

      positions.push(...cornerPositions);

      const additionalCount = playersCount - 4;
      const edgePositions = this.generateEdgePositions(additionalCount, margin, minDistance);

      positions.push(...edgePositions);
    }

    return positions.slice(0, playersCount);
  }

  private generateEdgePositions(count: number, margin: number, minDistance: number): Array<{ x: number; y: number }> {
    const positions: Array<{ x: number; y: number }> = [];

    // Позиции по краям карты
    const edgePositions = [
      {
        x: Math.floor(this.size.x / 2),
        y: margin,
      }, // верх
      {
        x: Math.floor(this.size.x / 2),
        y: this.size.y - margin,
      }, // низ
      {
        x: margin,
        y: Math.floor(this.size.y / 2),
      }, // лево
      {
        x: this.size.x - margin,
        y: Math.floor(this.size.y / 2),
      }, // право
    ];

    for (let i = 0; i < Math.min(count, edgePositions.length); i++) {
      positions.push(edgePositions[i]);
    }

    return positions;
  }

  public digTerrain(x: number, y: number): boolean {
    if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
      return false;
    }

    const currentTerrain = this.terrainData[y][x];

    // Bedrock неразрушимый
    if (currentTerrain === TerrainType.Bedrock) {
      return false;
    }

    // Все остальные типы превращаются в пустоту
    if (currentTerrain !== TerrainType.Empty) {
      this.terrainData[y][x] = TerrainType.Empty;
      return true;
    }

    return false;
  }

  public isTerrainPassable(x: number, y: number): boolean {
    if (x < 0 || x >= this.size.x || y < 0 || y >= this.size.y) {
      return false;
    }

    const terrain = this.terrainData[y][x];

    return terrain === TerrainType.Empty;
  }

  public canBuildAt(x: number, y: number): boolean {
    return this.isTerrainPassable(x, y);
  }

  private ensureSpawnAccessibilityWithResources(): void {
    for (const spawnPoint of this.spawnPoints) {
      const spawnX = spawnPoint.toJSON().x;
      const spawnY = spawnPoint.toJSON().y;
      const immediateRadius = 2; // Зона для немедленного строительства
      const clearRadius = 4; // Общая зона доступности
      const guaranteedResourceRadius = 8; // Зона гарантированных ресурсов

      // Очищаем стартовую зону
      for (let dy = -clearRadius; dy <= clearRadius; dy++) {
        for (let dx = -clearRadius; dx <= clearRadius; dx++) {
          const x = spawnX + dx;
          const y = spawnY + dy;

          if (x >= 0 && x < this.size.x && y >= 0 && y < this.size.y) {
            const distance = euclideanDistance(0, 0, dx, dy);

            if (distance <= immediateRadius) {
              this.terrainData[y][x] = TerrainType.Empty;
            } else if (distance <= clearRadius) {
              if (this.terrainData[y][x] === TerrainType.Bedrock) {
                this.terrainData[y][x] = TerrainType.Rock;
              }
              // Убираем ресурсы из ближайшей стартовой зоны
              if (
                this.terrainData[y][x] === TerrainType.GoldCluster
                || this.terrainData[y][x] === TerrainType.CrystalCluster
                || this.terrainData[y][x] === TerrainType.IronCluster
              ) {
                this.terrainData[y][x] = TerrainType.Dirt;
              }
            }
          }
        }
      }

      // Размещаем гарантированные ресурсы (золото и железо)
      this.placeGuaranteedSpawnResources(spawnX, spawnY, clearRadius, guaranteedResourceRadius);
    }
  }

  private placeGuaranteedSpawnResources(
    spawnX: number,
    spawnY: number,
    minDistance: number,
    maxDistance: number,
  ): void {
    // Размещаем небольшое месторождение железа
    const ironAngle = Math.random() * 2 * Math.PI;
    const ironDistance = minDistance + 2 + Math.random() * (maxDistance - minDistance - 2);
    const ironX = Math.floor(spawnX + Math.cos(ironAngle) * ironDistance);
    const ironY = Math.floor(spawnY + Math.sin(ironAngle) * ironDistance);

    if (ironX >= 0 && ironX < this.size.x && ironY >= 0 && ironY < this.size.y) {
      this.generateContiguousResourceCluster(ironX, ironY, TerrainType.IronCluster, {
        radius: 2,
        density: 0.8,
      });
    }

    // Размещаем небольшое месторождение золота
    const goldAngle = ironAngle + Math.PI + (Math.random() - 0.5) * Math.PI;
    const goldDistance = minDistance + 2 + Math.random() * (maxDistance - minDistance - 2);
    const goldX = Math.floor(spawnX + Math.cos(goldAngle) * goldDistance);
    const goldY = Math.floor(spawnY + Math.sin(goldAngle) * goldDistance);

    if (goldX >= 0 && goldX < this.size.x && goldY >= 0 && goldY < this.size.y) {
      this.generateContiguousResourceCluster(goldX, goldY, TerrainType.GoldCluster, {
        radius: 2,
        density: 0.8,
      });
    }
  }
}
