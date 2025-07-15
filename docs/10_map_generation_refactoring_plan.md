# Рефакторинг алгоритмов генерации карты

> **⚠️ TODO:** План рефакторинга для выноса алгоритмов генерации карты из entity класса в специализированные утилитарные классы.

## 📋 Текущее состояние и проблемы

### Анализ Map Entity
- **Размер файла:** ~760 строк кода
- **Количество методов:** 20+ методов (из них 15+ для генерации)
- **Смешение ответственности:** Domain entity + алгоритмы генерации
- **Сложность тестирования:** Все алгоритмы привязаны к entity

### Выявленные проблемы
1. **Нарушение Single Responsibility Principle:** Map entity отвечает за хранение данных И за генерацию
2. **Низкая тестируемость:** Сложно тестировать отдельные алгоритмы
3. **Нет переиспользования:** Алгоритмы привязаны к конкретному классу
4. **Сложность чтения:** Большой файл с разнородной логикой
5. **Сложность оптимизации:** Алгоритмы смешаны с business logic

---

## 🎯 Целевая архитектура

### Принципы разделения
- **Разделение ответственности:** Entity только для данных, утилиты для алгоритмов
- **Composability:** Возможность комбинировать разные алгоритмы
- **Testability:** Каждый алгоритм легко покрыть unit-тестами
- **Reusability:** Алгоритмы можно использовать в разных контекстах

## 📅 План рефакторинга

### **Phase 1: Создание библиотеки и базовых утилит** ⏱️ 1-2 недели

#### 1.1 Создание пакета map-generation
```bash
# TODO: Создать новый пакет в libs/
mkdir -p libs/map-generation/src/{terrain,resources,spawn,validation,utils,types}
```

#### 1.2 Базовые типы и конфигурация
```typescript
// TODO: libs/map-generation/src/types/GenerationConfig.ts
export interface TerrainGenerationConfig {
  size: { x: number; y: number };
  layers: {
    dirt: { baseChance: number };
    rock: { distanceMultiplier: number };
    bedrock: { centralBonus: number };
  };
  formations: {
    bedrockFormations: { density: number; radius: Range };
    rockVeins: { density: number; length: Range };
  };
}

export interface ResourceGenerationConfig {
  playersCount: number;
  baseDensity: number;
  playerMultiplier: number;
  zones: {
    central: { radius: number };
    middle: { radius: number };
  };
  clustering: {
    gold: { radius: Range; density: number };
    iron: { radius: Range; density: number };
    crystal: { radius: Range; density: number };
  };
  spacing: {
    sameType: number;
    differentTypes: number;
    fromSpawn: number;
  };
}

export interface SpawnGenerationConfig {
  playersCount: number;
  margin: number;
  minDistance: number;
  accessibility: {
    immediateRadius: number;
    clearRadius: number;
  };
  guaranteedResources: {
    enabled: boolean;
    minDistance: number;
    maxDistance: number;
  };
}

type Range = { min: number; max: number };
```

#### 1.3 Геометрические утилиты
```typescript
// TODO: libs/map-generation/src/utils/GeometryUtils.ts
export class GeometryUtils {
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  static isWithinBounds(x: number, y: number, bounds: { width: number; height: number }): boolean {
    return x >= 0 && x < bounds.width && y >= 0 && y < bounds.height;
  }

  static getNeighbors8(x: number, y: number): Array<{ x: number; y: number }> {
    return [
      { x: x - 1, y: y - 1 }, { x: x, y: y - 1 }, { x: x + 1, y: y - 1 },
      { x: x - 1, y: y },                         { x: x + 1, y: y },
      { x: x - 1, y: y + 1 }, { x: x, y: y + 1 }, { x: x + 1, y: y + 1 }
    ];
  }

  static getNeighbors4(x: number, y: number): Array<{ x: number; y: number }> {
    return [
      { x: x, y: y - 1 },
      { x: x - 1, y: y }, { x: x + 1, y: y },
      { x: x, y: y + 1 }
    ];
  }

  static polarToCartesian(centerX: number, centerY: number, radius: number, angle: number): { x: number; y: number } {
    return {
      x: Math.floor(centerX + Math.cos(angle) * radius),
      y: Math.floor(centerY + Math.sin(angle) * radius)
    };
  }
}
```

### **Phase 2: Генераторы террейна** ⏱️ 2-3 недели

#### 2.1 TerrainLayerGenerator
```typescript
// TODO: libs/map-generation/src/terrain/TerrainLayerGenerator.ts
export class TerrainLayerGenerator {
  constructor(private config: TerrainGenerationConfig) {}

  generateBaseLayers(terrainData: TerrainType[][]): void {
    const { size } = this.config;
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < size.y; y++) {
      for (let x = 0; x < size.x; x++) {
        const distanceFromCenter = GeometryUtils.distance(x, y, centerX, centerY);
        const normalizedDistance = distanceFromCenter / maxDistance;

        const terrain = this.calculateTerrainType(normalizedDistance);
        terrainData[y][x] = terrain;
      }
    }
  }

  private calculateTerrainType(normalizedDistance: number): TerrainType {
    const { layers } = this.config;
    const random = Math.random();

    const rockProbability = normalizedDistance * layers.rock.distanceMultiplier;
    const bedrockProbability = (1 - normalizedDistance) * layers.bedrock.centralBonus;

    if (random < bedrockProbability) {
      return TerrainType.Bedrock;
    } else if (random < bedrockProbability + rockProbability) {
      return TerrainType.Rock;
    }

    return TerrainType.Dirt;
  }
}
```

#### 2.2 BedrockFormationGenerator
```typescript
// TODO: libs/map-generation/src/terrain/BedrockFormationGenerator.ts
export class BedrockFormationGenerator {
  constructor(private config: TerrainGenerationConfig) {}

  generateFormations(terrainData: TerrainType[][]): void {
    const { size, formations } = this.config;
    const formationCount = Math.floor((size.x * size.y) / formations.bedrockFormations.density);

    for (let i = 0; i < formationCount; i++) {
      this.generateSingleFormation(terrainData);
    }
  }

  private generateSingleFormation(terrainData: TerrainType[][]): void {
    const { size, formations } = this.config;
    const centerX = Math.floor(Math.random() * size.x);
    const centerY = Math.floor(Math.random() * size.y);
    const radius = NoiseGenerator.randomInRange(formations.bedrockFormations.radius);

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        if (GeometryUtils.isWithinBounds(x, y, size)) {
          const distance = GeometryUtils.distance(0, 0, dx, dy);
          const probability = Math.max(0, 1 - distance / radius);

          if (Math.random() < probability * 0.8) {
            terrainData[y][x] = TerrainType.Bedrock;
          }
        }
      }
    }
  }
}
```

### **Phase 3: Система размещения ресурсов** ⏱️ 3-4 недели

#### 3.1 ResourcePlacementEngine
```typescript
// TODO: libs/map-generation/src/resources/ResourcePlacementEngine.ts
export class ResourcePlacementEngine {
  private strategy: ResourcePlacementStrategy;
  private clusterGenerator: ContiguousClusterGenerator;
  private balancer: ResourceBalancer;

  constructor(
    private config: ResourceGenerationConfig,
    strategy?: ResourcePlacementStrategy
  ) {
    this.strategy = strategy ?? new ZonedResourceStrategy(config);
    this.clusterGenerator = new ContiguousClusterGenerator();
    this.balancer = new ResourceBalancer(config);
  }

  async generateResources(
    terrainData: TerrainType[][],
    spawnPoints: Array<{ x: number; y: number }>
  ): Promise<void> {
    // Расчет количества ресурсов
    const resourceCounts = this.balancer.calculateResourceCounts();

    // Размещение по стратегии
    const placements = await this.strategy.placeClusters(
      terrainData,
      spawnPoints,
      resourceCounts
    );

    // Генерация кластеров
    for (const placement of placements) {
      await this.clusterGenerator.generateCluster(
        terrainData,
        placement.x,
        placement.y,
        placement.type,
        placement.config
      );
    }
  }
}

export interface ResourcePlacementStrategy {
  placeClusters(
    terrainData: TerrainType[][],
    spawnPoints: Array<{ x: number; y: number }>,
    resourceCounts: ResourceCounts
  ): Promise<ResourcePlacement[]>;
}
```

#### 3.2 ZonedResourceStrategy
```typescript
// TODO: libs/map-generation/src/resources/ZonedResourceStrategy.ts
export class ZonedResourceStrategy implements ResourcePlacementStrategy {
  constructor(private config: ResourceGenerationConfig) {}

  async placeClusters(
    terrainData: TerrainType[][],
    spawnPoints: Array<{ x: number; y: number }>,
    resourceCounts: ResourceCounts
  ): Promise<ResourcePlacement[]> {
    const zones = this.calculateZones(terrainData);
    const placements: ResourcePlacement[] = [];

    // Кристаллы только в центральной зоне
    placements.push(...await this.placeCrystalsInZone(zones.central, resourceCounts.crystals));

    // Золото в центральной и средней зонах
    placements.push(...await this.placeGoldInZones(zones, resourceCounts.gold));

    // Железо в средней и внешней зонах
    placements.push(...await this.placeIronInZones(zones, resourceCounts.iron));

    return placements;
  }

  private calculateZones(terrainData: TerrainType[][]): MapZones {
    const size = { x: terrainData[0].length, y: terrainData.length };
    const centerX = Math.floor(size.x / 2);
    const centerY = Math.floor(size.y / 2);
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    return {
      central: {
        centerX, centerY,
        radius: maxDistance * this.config.zones.central.radius
      },
      middle: {
        centerX, centerY,
        radius: maxDistance * this.config.zones.middle.radius
      },
      outer: {
        centerX, centerY,
        radius: maxDistance
      }
    };
  }
}
```

### **Phase 4: Генератор спавн-поинтов** ⏱️ 1-2 недели

#### 4.1 SpawnPointGenerator
```typescript
// TODO: libs/map-generation/src/spawn/SpawnPointGenerator.ts
export class SpawnPointGenerator {
  private positionCalculator: SpawnPositionCalculator;
  private accessibilityEnsurer: SpawnAccessibilityEnsurer;

  constructor(private config: SpawnGenerationConfig) {
    this.positionCalculator = new SpawnPositionCalculator(config);
    this.accessibilityEnsurer = new SpawnAccessibilityEnsurer(config);
  }

  generateSpawnPoints(
    terrainData: TerrainType[][],
    size: { x: number; y: number }
  ): Array<{ x: number; y: number }> {
    // Расчет позиций спавна
    const positions = this.positionCalculator.calculatePositions(size);

    // Обеспечение доступности
    this.accessibilityEnsurer.ensureAccessibility(terrainData, positions);

    // Размещение гарантированных ресурсов (если включено)
    if (this.config.guaranteedResources.enabled) {
      this.accessibilityEnsurer.placeGuaranteedResources(terrainData, positions);
    }

    return positions;
  }
}
```

### **Phase 5: Обновление Map Entity** ⏱️ 1 неделя

#### 5.1 Упрощенная Map Entity
```typescript
// TODO: Обновить apps/backend/src/map/domain/map.entity.ts
export class Map {
  public readonly id: Uuid;
  public readonly size: MapSize;
  public terrainData: TerrainType[][];
  public spawnPoints: SpawnPoint[];

  // Основной конструктор без изменений
  constructor(params: MapConstructorParams) { /* ... */ }

  // Методы для игровой логики (НЕ генерации)
  public digTerrain(x: number, y: number): boolean { /* ... */ }
  public isTerrainPassable(x: number, y: number): boolean { /* ... */ }
  public canBuildAt(x: number, y: number): boolean { /* ... */ }

  // Упрощенные методы генерации (делегирование к утилитам)
  public generateTerrain(): void {
    const generator = new TerrainGenerator({
      size: { x: this.size.x, y: this.size.y },
      // ... конфигурация
    });

    this.terrainData = generator.generate();
  }

  public generateTerrainWithResources(playersCount: number): void {
    this.generateTerrain();
    this.generateSpawnPoints(playersCount);

    const resourceEngine = new ResourcePlacementEngine({
      playersCount,
      // ... конфигурация
    });

    resourceEngine.generateResources(
      this.terrainData,
      this.spawnPoints.map(sp => sp.toJSON())
    );
  }

  public generateSpawnPoints(playersCount: number): void {
    const generator = new SpawnPointGenerator({
      playersCount,
      // ... конфигурация
    });

    const positions = generator.generateSpawnPoints(
      this.terrainData,
      { x: this.size.x, y: this.size.y }
    );

    this.spawnPoints = positions.map(pos => new SpawnPoint(pos.x, pos.y));
  }
}
```

---

## 🧪 Тестирование

### Unit тесты для утилит
```typescript
// TODO: libs/map-generation/src/terrain/__tests__/TerrainLayerGenerator.test.ts
describe('TerrainLayerGenerator', () => {
  it('should generate consistent terrain layers') {
    const config = createTestConfig();
    const generator = new TerrainLayerGenerator(config);
    const terrain = Array(100).fill(null).map(() => Array(100).fill(TerrainType.Dirt));

    generator.generateBaseLayers(terrain);

    expect(terrain[50][50]).toBe(TerrainType.Bedrock); // Центр должен быть bedrock
    expect(terrain[0][0]).not.toBe(TerrainType.Bedrock); // Углы не должны быть bedrock
  });

  it('should respect configuration parameters') {
    // Тестирование различных конфигураций
  });
});

describe('ResourcePlacementEngine', () => {
  it('should place resources according to strategy') {
    // Тестирование размещения ресурсов
  });

  it('should maintain minimum distances between clusters') {
    // Тестирование соблюдения дистанций
  });
});
```

### Integration тесты
```typescript
// TODO: apps/backend/src/map/__tests__/map-generation-integration.test.ts
describe('Map Generation Integration', () => {
  it('should generate valid map with all components') {
    const map = new Map({
      id: new Uuid(),
      size: new MapSize(100, 100)
    });

    map.generateTerrainWithResources(4);

    expect(map.spawnPoints).toHaveLength(4);
    expect(map.terrainData).toBeDefined();
    // Проверка валидности сгенерированной карты
  });
});
```

---

## 📊 Преимущества рефакторинга

### До рефакторинга:
- **Map.entity.ts:** 760 строк, 20+ методов
- **Тестирование:** Сложно тестировать отдельные алгоритмы
- **Переиспользование:** Невозможно
- **Читаемость:** Низкая из-за смешения логики

### После рефакторинга:
- **Map.entity.ts:** ~150 строк, фокус на business logic
- **Утилитарные классы:** 8-10 специализированных классов
- **Тестирование:** Каждый алгоритм покрыт unit-тестами
- **Переиспользование:** Алгоритмы можно использовать в разных контекстах
- **Читаемость:** Высокая благодаря разделению ответственности

### Метрики качества:
- **Cyclomatic Complexity:** Снижение в 3-4 раза
- **Test Coverage:** Увеличение с 30% до 90%+
- **Lines of Code per Class:** Снижение с 760 до 50-150
- **Maintainability Index:** Увеличение на 40-50%

---

## 🔗 Связь с планом оптимизации

Данный рефакторинг **хорошо сочетается** с [планом оптимизации системы карт](./09_map_optimization_refactoring_plan.md):

1. **Совместимость:** Утилитарные классы легко адаптировать для работы с чанками
2. **Тестируемость:** Проще тестировать алгоритмы на небольших чанках
3. **Производительность:** Можно оптимизировать отдельные алгоритмы для chunked-архитектуры
4. **Миграция:** Новые утилиты облегчат миграцию существующих карт

### Рекомендуемый порядок выполнения:
1. **Сначала:** Данный рефакторинг (разделение алгоритмов)
2. **Опционально:** [Система слоевой генерации карт](./11_layered_map_generation_system.md) (композиция алгоритмов)
3. **Затем:** План оптимизации (chunking + синхронизация)

---

## ✅ Критерии готовности

- [ ] Все алгоритмы вынесены из Map entity
- [ ] Map entity содержит только business logic и delegation
- [ ] Каждый утилитарный класс покрыт unit-тестами (>90%)
- [ ] Integration тесты подтверждают корректность генерации
- [ ] Производительность генерации не ухудшилась
- [ ] Код соответствует архитектурным принципам проекта

---

> **⚠️ Важно:** Этот рефакторинг критичен для дальнейшего развития системы. Без разделения ответственности будет сложно поддерживать и развивать алгоритмы генерации карт.

> **✅ Выгода:** После рефакторинга команда сможет легко добавлять новые алгоритмы генерации, A/B тестировать различные стратегии размещения ресурсов и оптимизировать производительность отдельных компонентов.