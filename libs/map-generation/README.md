# Universal Map Generation Library

Универсальная библиотека для генерации 2D карт любых типов. Не содержит игровой логики и может использоваться для различных задач: от карт высот до размещения объектов на сетке.

## 🎯 Основные принципы

- **Универсальность**: Работает с любыми типами данных (числа, строки, булевы значения)
- **Модульность**: Каждый компонент решает одну задачу
- **Типобезопасность**: Полная поддержка TypeScript generic типов
- **Функциональность**: Богатый набор утилит для геометрии, шума и размещения

## 🏗️ Архитектура

### Типы данных

- `Grid<T>` - двумерная сетка значений любого типа
- `Position` - координаты на карте
- `MapSize` - размеры карты
- Конфигурационные интерфейсы для различных алгоритмов

### Основные компоненты

- **GridGenerator** - создание и манипуляция 2D сетками
- **FormationGenerator** - создание формаций и кластеров
- **PlacementGenerator** - размещение объектов с ограничениями
- **Утилитарные классы** - геометрия, шум, расчеты расстояний

## 📦 Установка

```json
{
  "dependencies": {
    "@libs/map-generation": "workspace:*"
  }
}
```

## 🚀 Быстрый старт

### Создание простой карты

```typescript
import { GridGenerator, MapSize } from '@libs/map-generation';

// Числовая карта (карта высот)
const heightMap = GridGenerator.createEmpty<number>({ x: 50, y: 50 }, 0);

// Строковая карта (биомы)
const biomeMap = GridGenerator.createWith<string>(
  { x: 50, y: 50 },
  (x, y) => Math.random() > 0.5 ? 'forest' : 'plains'
);

// Карта на основе расстояния от центра
const radialMap = GridGenerator.createDistanceBased<number>(
  { x: 100, y: 100 },
  (normalizedDistance) => Math.floor((1 - normalizedDistance) * 100)
);
```

### Генерация с использованием шума

```typescript
import { GridGenerator, NoiseGenerator } from '@libs/map-generation';

const heightMap = GridGenerator.createNoiseBased<number>(
  { x: 100, y: 100 },
  (x, y) => NoiseGenerator.octaveNoise(x, y, 4, 0.5),
  (noise) => Math.floor(noise * 255) // Высота 0-255
);
```

## 🔧 Основные компоненты

### GridGenerator

Создание и манипуляция 2D сетками:

```typescript
import { GridGenerator } from '@libs/map-generation';

// Пустая сетка
const grid = GridGenerator.createEmpty<number>({ x: 50, y: 50 }, 0);

// Сетка с функцией инициализации
const customGrid = GridGenerator.createWith<string>(
  { x: 30, y: 30 },
  (x, y) => `cell_${x}_${y}`
);

// Безопасная работа с сеткой
GridGenerator.setValue(grid, { x: 10, y: 10 }, 42);
const value = GridGenerator.getValue(grid, { x: 10, y: 10 });

// Трансформация сетки
const stringGrid = GridGenerator.transform(grid, (value, x, y) => value.toString());

// Фильтрация позиций по условию
const highPoints = GridGenerator.filterPositions(
  grid,
  (value) => value > 100
);
```

### FormationGenerator

Создание формаций и кластеров:

```typescript
import { FormationGenerator } from '@libs/map-generation';

// Радиальная формация
FormationGenerator.createRadialFormation(
  grid,
  { x: 25, y: 25 }, // центр
  10, // радиус
  255 // значение
);

// Линейная формация (река, дорога)
FormationGenerator.createLinearFormation(
  grid,
  { x: 0, y: 25 }, // начало
  0, // угол (горизонтально)
  50, // длина
  'river'
);

// Связный кластер
FormationGenerator.createContiguousCluster(
  grid,
  { x: 40, y: 40 },
  {
    radius: 8,
    density: 0.7,
    falloffType: 'quadratic'
  },
  'forest'
);

// Очистка области
FormationGenerator.clearArea(grid, { x: 25, y: 25 }, 5, 'empty');
```

### PlacementGenerator

Размещение объектов с ограничениями:

```typescript
import { PlacementGenerator } from '@libs/map-generation';

// Простое размещение с минимальным расстоянием
const cities = PlacementGenerator.placeObjects(
  grid,
  {
    count: 5,
    minDistance: 15,
    maxDistance: 40
  },
  'city'
);

// Размещение по краям карты
const spawns = PlacementGenerator.placeAroundEdges(
  grid,
  4, // количество
  5, // отступ от края
  10, // минимальное расстояние
  'spawn'
);

// Размещение по кругу
const towers = PlacementGenerator.placeInCircle(
  grid,
  { x: 50, y: 50 }, // центр
  20, // радиус
  6, // количество
  'tower'
);
```

### Утилитарные классы

#### GeometryUtils - геометрические операции

```typescript
import { GeometryUtils } from '@libs/map-generation';

// Расчет расстояний
const distance = GeometryUtils.distance(0, 0, 10, 10);

// Работа с центром карты
const center = GeometryUtils.getMapCenter({ x: 100, y: 100 });
const maxDistance = GeometryUtils.getMaxDistanceFromCenter({ x: 100, y: 100 });

// Соседние клетки
const neighbors8 = GeometryUtils.getNeighbors8(25, 25);
const neighbors4 = GeometryUtils.getNeighbors4(25, 25);

// Случайные позиции
const randomPos = GeometryUtils.randomPosition({ x: 100, y: 100 });
const circlePos = GeometryUtils.randomPositionInCircle(50, 50, 10, 20);
```

#### NoiseGenerator - генерация шума

```typescript
import { NoiseGenerator } from '@libs/map-generation';

// Случайные значения
const value = NoiseGenerator.randomInRange({ min: 10, max: 50 });
const intValue = NoiseGenerator.randomIntInRange({ min: 1, max: 6 });

// Шум для процедурной генерации
const noise = NoiseGenerator.normalizedNoise(x, y, 0.1);
const complexNoise = NoiseGenerator.octaveNoise(x, y, 4, 0.5);

// Интерполяция
const lerped = NoiseGenerator.lerp(0, 100, 0.5); // 50
const smoothed = NoiseGenerator.smoothstep(0, 1, 0.3);
```

#### DistanceCalculator - работа с расстояниями

```typescript
import { DistanceCalculator } from '@libs/map-generation';

const pos1 = { x: 0, y: 0 };
const pos2 = { x: 3, y: 4 };

// Различные метрики расстояний
const euclidean = DistanceCalculator.euclidean(pos1, pos2); // 5
const manhattan = DistanceCalculator.manhattan(pos1, pos2); // 7
const chebyshev = DistanceCalculator.chebyshev(pos1, pos2); // 4

// Работа с группами позиций
const positions = [{ x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 30 }];
const closest = DistanceCalculator.findClosest(pos1, positions);
const clusters = DistanceCalculator.clusterByDistance(positions, 15);
```

## 🎮 Практические примеры

### Карта высот

```typescript
import { UniversalUsageExample } from '@libs/map-generation';

// Создание карты высот с шумом
const heightMap = UniversalUsageExample.createHeightMap(100, 100);

// Добавление горных формаций
UniversalUsageExample.addFormations(heightMap);

// Статистика
UniversalUsageExample.getGridStats(heightMap);
```

### Карта биомов

```typescript
// Создание категориальной карты
const biomeMap = UniversalUsageExample.createBiomeMap(100, 100);

// Размещение объектов
UniversalUsageExample.placeObjects(biomeMap);

// Отображение в консоли (для небольших карт)
UniversalUsageExample.printGrid(biomeMap, 15);
```

### Комплексная карта мира

```typescript
const world = UniversalUsageExample.createWorldMap(200, 200);

console.log('Создан мир:');
console.log(`- Карта высот: ${world.heightMap.length}x${world.heightMap[0].length}`);
console.log(`- Карта биомов: ${world.biomeMap.length}x${world.biomeMap[0].length}`);
console.log(`- Объектов размещено: ${world.positions.length}`);
```

## 🎯 Применения

- **Игровые карты**: высоты, биомы, размещение объектов
- **Процедурная генерация**: лабиринты, пещеры, города
- **Научная визуализация**: тепловые карты, распределения
- **Алгоритмы**: поиск пути, кластеризация, анализ связности
- **Любые 2D данные**: изображения, паттерны, сетки

## ⚡ Производительность

- Оптимизированные алгоритмы для больших карт
- Типобезопасность без потери производительности
- Ленивые вычисления где возможно
- Эффективная работа с памятью

## 🧪 Тестирование

```bash
cd libs/map-generation
pnpm test # когда тесты будут добавлены
```

## 📈 Преимущества

✅ **Универсальность** - работает с любыми типами данных
✅ **Типобезопасность** - полная поддержка TypeScript
✅ **Модульность** - используйте только нужные компоненты
✅ **Производительность** - оптимизировано для больших карт
✅ **Гибкость** - богатые возможности конфигурации
✅ **Простота** - интуитивно понятный API

Библиотека готова к использованию в любых проектах требующих работы с 2D картами!
