import {
  Uuid, MapSize, SpawnPoint,
} from '@libs/domain-primitives';
import { Vector2 } from '@libs/utils';
import {
  euclideanDistance, distanceFromCenter, maxDistanceFromCenter,
  calculateMultiLayerProbabilities, calculateRadialProbability,
  randomBoolean, floodFill, FloodFillCallbacks,
  findValidPosition, createExclusionZones,
  generateLinearFormationsOnGrid, type LinearFormationConfig,
  type PlacementZone, type PlacementObject,
  type ExclusionZone, type PlacementCallbacks,
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
    // Создаем зону размещения
    const zone: PlacementZone = {
      center: {
        x: centerX,
        y: centerY,
      },
      minRadius,
      maxRadius,
    };

    // Конвертируем существующие кластеры в формат PlacementObject
    const existingObjects: PlacementObject[] = placedClusters.map(cluster => ({
      position: {
        x: cluster.x,
        y: cluster.y,
      },
      type: cluster.type,
      radius: cluster.radius,
    }));

    // Создаем зоны исключения для спавнов
    const spawnPoints = this.spawnPoints.map(sp => sp.toJSON());
    const exclusionZones: ExclusionZone[] = createExclusionZones(spawnPoints, 12);

    // Создаем callbacks для проверки границ
    const callbacks: PlacementCallbacks = {
      isInBounds: (position: Vector2) =>
        position.x >= 0 && position.x < this.size.x && position.y >= 0 && position.y < this.size.y,
    };

    // Используем универсальный алгоритм размещения
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
    centerX: number,
    centerY: number,
    resourceType: TerrainType,
    config: { radius: number; density: number },
  ): void {
    // Создаем callback'и для работы с нашей картой
    const callbacks: FloodFillCallbacks<TerrainType> = {
      isInBounds: (position: Vector2) =>
        position.x >= 0 && position.x < this.size.x && position.y >= 0 && position.y < this.size.y,
      canModify: (position: Vector2) => this.terrainData[position.y][position.x] !== TerrainType.Bedrock,
      setCell: (position: Vector2, value: TerrainType) => { this.terrainData[position.y][position.x] = value; },
      getCell: (position: Vector2) => this.terrainData[position.y][position.x],
    };

    // Используем универсальный FloodFill алгоритм
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

  private generateTerrainLayers(): void {
    const centerX = Math.floor(this.size.x / 2);
    const centerY = Math.floor(this.size.y / 2);

    for (let y = 0; y < this.size.y; y++) {
      for (let x = 0; x < this.size.x; x++) {
        const currentDistanceFromCenter = distanceFromCenter(x, y, centerX, centerY);
        const maxDistance = maxDistanceFromCenter(this.size.x, this.size.y);

        const normalizedDistance = currentDistanceFromCenter / maxDistance;

        // Конфигурация слоев террейна (бизнес-логика)
        const [rockProbability, bedrockProbability] = calculateMultiLayerProbabilities({
          normalizedDistance,
          layers: [
            {
              multiplier: 0.4,
              invertDistance: false,
            }, // Rock: увеличивается с расстоянием
            {
              multiplier: 0.15,
              invertDistance: true,
            }, // Bedrock: уменьшается с расстоянием
          ],
        });

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
            const probability = calculateRadialProbability({
              distance,
              radius,
            });

            if (randomBoolean(probability)) {
              this.terrainData[y][x] = TerrainType.Bedrock;
            }
          }
        }
      }
    }
  }

  private addRockVariations(): void {
    // Конфигурация для генерации каменных жил
    const formationConfig: LinearFormationConfig = {
      density: 2.5, // ~2.5 жилы на 1000 клеток (было ~1 жила на 400 клеток)
      minLength: 5,
      maxLength: 15,
      minThickness: 1,
      maxThickness: 3,
      noiseAmount: 1.0,
      placementProbability: 0.7,
    };

    // Используем универсальный алгоритм генерации формаций
    generateLinearFormationsOnGrid(
      this.terrainData,
      formationConfig,
      TerrainType.Rock,
      (x, y, currentValue, newValue) => currentValue === TerrainType.Dirt,
    );
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
