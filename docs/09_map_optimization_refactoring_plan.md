# План рефакторинга и оптимизации системы карт

> **⚠️ TODO:** Данный документ содержит план рефакторинга для оптимизации синхронизации карты между клиентом и сервером.

## 📋 Обзор проблемы

### Текущее состояние
- Карта хранится как JSON-поле `terrainData: TerrainType[][]` в PostgreSQL
- При каждом изменении требуется загрузка/сохранение всего массива
- Карты до 1000×1000 клеток = до **15 МБ** данных
- Множественные акторы постоянно изменяют карту
- Клиенты требуют реалтайм синхронизации

### Проблемы производительности
1. **Избыточный трафик:** Отправка всей карты при любом изменении
2. **Задержки БД:** Сериализация/десериализация больших JSON-объектов
3. **Память клиента:** Хранение неактивных областей карты
4. **Конкурентность:** Конфликты при одновременных изменениях

---

## 🎯 Стратегия решения

### Основные принципы оптимизации
- **Area of Interest (AOI):** Клиент получает только видимую область
- **Chunking:** Разбиение карты на управляемые блоки
- **Delta Updates:** Отправка только изменений
- **Viewport-based Loading:** Загрузка по требованию

---

## 📅 План рефакторинга

### **Phase 1: Базовая инфраструктура чанков** ⏱️ 2-3 недели

#### 1.1 Обновление схемы БД
```sql
-- TODO: Создать таблицу для чанков карты
CREATE TABLE map_chunks (
    map_id UUID REFERENCES maps(id),
    chunk_x INTEGER NOT NULL,
    chunk_y INTEGER NOT NULL,
    chunk_data JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    last_modified TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (map_id, chunk_x, chunk_y)
);

CREATE INDEX idx_map_chunks_version ON map_chunks(map_id, version);
CREATE INDEX idx_map_chunks_modified ON map_chunks(last_modified);
```

#### 1.2 Обновление Prisma схемы
```prisma
// TODO: Добавить модель MapChunk
model MapChunk {
  mapId       String   @map("map_id")
  chunkX      Int      @map("chunk_x")
  chunkY      Int      @map("chunk_y")
  data        Json     // TerrainCell[] для чанка 32x32
  version     Int      @default(1)
  lastModified DateTime @default(now()) @map("last_modified")

  map Map @relation(fields: [mapId], references: [id])

  @@id([mapId, chunkX, chunkY])
  @@map("map_chunks")
}

// TODO: Обновить модель Map
model Map {
  id            String      @id @default(uuid())
  gameSessionId String      @unique @map("game_session_id")
  gameSession   GameSession @relation(fields: [gameSessionId], references: [id])
  size          Json        // Остается без изменений
  spawnPoints   Json        @map("spawn_points") // Остается без изменений
  chunks        MapChunk[]  // Новая связь

  // TODO: Удалить terrainData после миграции
  // terrainData   Json        @map("terrain_data")

  @@map("maps")
}
```

#### 1.3 Создание типов данных
```typescript
// TODO: Создать файл libs/domain-primitives/src/map-chunk.value-object.ts
interface TerrainCell {
  x: number;           // Абсолютная координата
  y: number;           // Абсолютная координата
  terrain: TerrainType;
  lastModified: number; // timestamp
}

interface MapChunk {
  chunkId: string;      // "x_y" формат
  mapId: string;
  chunkX: number;       // Координата чанка
  chunkY: number;       // Координата чанка
  size: number;         // Размер чанка (32x32)
  data: TerrainCell[];  // Данные клеток
  version: number;      // Версия для отслеживания изменений
  lastModified: Date;
}

interface TerrainDelta {
  type: 'terrain_change';
  mapId: string;
  changes: Array<{
    x: number;
    y: number;
    oldTerrain: TerrainType;
    newTerrain: TerrainType;
    timestamp: number;
    playerId?: string;
  }>;
  chunkIds: string[];   // Затронутые чанки
}
```

### **Phase 2: Сервисы и репозитории** ⏱️ 2-3 недели

#### 2.1 MapChunkService
```typescript
// TODO: Создать apps/backend/src/map/domain/map-chunk.service.ts
@Injectable()
export class MapChunkService {
  private readonly CHUNK_SIZE = 32;

  // TODO: Реализовать методы
  async getChunksInViewport(mapId: string, centerX: number, centerY: number, viewWidth: number, viewHeight: number): Promise<MapChunk[]>
  async getChunksInRange(mapId: string, startChunkX: number, endChunkX: number, startChunkY: number, endChunkY: number): Promise<MapChunk[]>
  async updateTerrain(mapId: string, x: number, y: number, newTerrain: TerrainType): Promise<TerrainDelta>
  async updateChunkCell(mapId: string, chunkX: number, chunkY: number, x: number, y: number, newTerrain: TerrainType): Promise<MapChunk>
  async getChunkByCoords(mapId: string, chunkX: number, chunkY: number): Promise<MapChunk | null>
  async createChunk(mapId: string, chunkX: number, chunkY: number, data: TerrainCell[]): Promise<MapChunk>
}
```

#### 2.2 MapChunkRepository
```typescript
// TODO: Создать apps/backend/src/map/db/map-chunk.repository.ts
@Injectable()
export class MapChunkRepository {
  // TODO: Реализовать CRUD операции для чанков
  async create(chunk: MapChunk): Promise<MapChunkDb>
  async findByMapAndCoords(mapId: string, chunkX: number, chunkY: number): Promise<MapChunkDb | null>
  async findChunksInRange(mapId: string, minX: number, maxX: number, minY: number, maxY: number): Promise<MapChunkDb[]>
  async updateChunkData(mapId: string, chunkX: number, chunkY: number, data: TerrainCell[]): Promise<MapChunkDb>
  async incrementVersion(mapId: string, chunkX: number, chunkY: number): Promise<void>
}
```

#### 2.3 Миграция существующих карт
```typescript
// TODO: Создать скрипт миграции apps/backend/src/scripts/migrate-maps-to-chunks.ts
export class MapMigrationService {
  async migrateExistingMaps(): Promise<void> {
    // Читаем все существующие карты
    // Разбиваем terrainData на чанки
    // Создаем записи в map_chunks
    // Опционально удаляем terrainData из maps
  }
}
```

### **Phase 3: WebSocket синхронизация** ⏱️ 3-4 недели

#### 3.1 Обновление MapSyncGateway
```typescript
// TODO: Обновить apps/backend/src/map/api/map.gateway.ts
@WebSocketGateway()
export class MapSyncGateway {
  private playersViewports = new Map<string, ViewportInfo>();

  // TODO: Реализовать методы
  @SubscribeMessage('viewport_update')
  async handleViewportUpdate(@MessageBody() data: ViewportRequest, @ConnectedSocket() client: Socket)

  @SubscribeMessage('terrain_dig')
  async handleTerrainDig(@MessageBody() data: { mapId: string, x: number, y: number }, @ConnectedSocket() client: Socket)

  @SubscribeMessage('building_place')
  async handleBuildingPlace(@MessageBody() data: { mapId: string, x: number, y: number, buildingType: string }, @ConnectedSocket() client: Socket)

  private broadcastDeltaToArea(mapId: string, delta: TerrainDelta): void
  private getPlayersInChunks(mapId: string, chunkIds: string[]): string[]
  private updatePlayerViewport(playerId: string, viewport: ViewportInfo): void
}
```

#### 3.2 Новые DTO для WebSocket
```typescript
// TODO: Создать apps/backend/src/map/api/map-sync.dto.ts
interface ViewportRequest {
  playerId: string;
  mapId: string;
  centerX: number;
  centerY: number;
  viewWidth: number;
  viewHeight: number;
  currentChunks: string[]; // Уже загруженные чанки
}

interface ViewportResponse {
  newChunks: MapChunk[];      // Новые чанки для загрузки
  updatedChunks: MapChunk[];  // Обновленные чанки
  removedChunks: string[];    // Чанки для выгрузки из памяти
}

interface MapUpdateEvent {
  type: 'map_delta';
  mapId: string;
  deltaId: string;
  delta: TerrainDelta;
  affectedPlayers: string[];
}
```

### **Phase 4: Клиентская оптимизация** ⏱️ 2-3 недели

#### 4.1 ClientMapManager
```typescript
// TODO: Создать apps/frontend/src/game/map/ClientMapManager.ts
class ClientMapManager {
  private loadedChunks = new Map<string, MapChunk>();
  private viewportCenter = { x: 0, y: 0 };
  private readonly PRELOAD_RADIUS = 2; // Чанков вокруг viewport
  private readonly UNLOAD_RADIUS = 4;  // Радиус выгрузки чанков

  // TODO: Реализовать методы
  updateViewport(centerX: number, centerY: number): void
  applyDelta(delta: TerrainDelta): void
  getTerrainAt(x: number, y: number): TerrainType | null
  preloadNearbyChunks(centerX: number, centerY: number): void
  unloadDistantChunks(centerX: number, centerY: number): void
  requestChunksForViewport(centerX: number, centerY: number): void
}
```

#### 4.2 Обновление рендеринга карты
```typescript
// TODO: Обновить apps/frontend/src/game/rendering/MapRenderer.ts
class MapRenderer {
  private chunkCache = new Map<string, HTMLCanvasElement>();

  // TODO: Реализовать методы
  renderChunk(chunk: MapChunk): HTMLCanvasElement
  updateChunkCell(chunkId: string, x: number, y: number, terrain: TerrainType): void
  renderViewport(chunks: MapChunk[], viewportBounds: Rectangle): void
  invalidateChunk(chunkId: string): void
}
```

---

## 🔧 Техническая спецификация

### Константы системы
```typescript
// TODO: Добавить в конфигурацию
const MAP_CONFIG = {
  CHUNK_SIZE: 32,           // Размер чанка в клетках
  VIEWPORT_PRELOAD_RADIUS: 2,  // Чанков вокруг видимой области
  VIEWPORT_UNLOAD_RADIUS: 4,   // Радиус выгрузки чанков
  MAX_CHUNKS_PER_CLIENT: 100,  // Лимит чанков на клиента
  DELTA_BATCH_SIZE: 50,        // Максимум изменений в одной дельте
  CHUNK_CACHE_TTL: 300000,     // TTL кэша чанков (5 минут)
};
```

### Оценка производительности

#### Без оптимизации (текущее состояние):
- **Трафик на изменение:** ~15 МБ (вся карта)
- **Память клиента:** ~15 МБ (постоянно)
- **Задержка обновления:** ~200-500ms

#### После оптимизации:
- **Трафик на изменение:** ~50-200 байт (дельта)
- **Память клиента:** ~2-5 МБ (активные чанки)
- **Задержка обновления:** ~10-50ms

#### Экономия ресурсов:
- **Трафик:** 99.8% снижение
- **Память:** 70-80% снижение
- **Производительность БД:** 90%+ улучшение

---

## 🧪 Тестирование

### Unit тесты
```typescript
// TODO: Создать тесты
describe('MapChunkService', () => {
  it('should split map into correct chunks')
  it('should update terrain and create delta')
  it('should handle chunk boundaries correctly')
  it('should validate chunk coordinates')
})

describe('ClientMapManager', () => {
  it('should load chunks in viewport')
  it('should apply deltas correctly')
  it('should unload distant chunks')
  it('should handle chunk caching')
})
```

### Integration тесты
```typescript
// TODO: Создать тесты
describe('Map Synchronization', () => {
  it('should sync terrain changes between clients')
  it('should handle concurrent modifications')
  it('should maintain consistency during chunk loading')
  it('should recover from connection drops')
})
```

### Performance тесты
```typescript
// TODO: Создать бенчмарки
describe('Performance Benchmarks', () => {
  it('should handle 1000+ concurrent players')
  it('should maintain <50ms delta delivery')
  it('should limit memory usage per client')
  it('should handle large terrain modifications')
})
```

---

## 🚀 Миграционная стратегия

### Этап 1: Подготовка
- [ ] Создание новых таблиц без удаления старых
- [ ] Реализация dual-write (запись в оба формата)
- [ ] Тестирование на dev/staging средах

### Этап 2: Миграция данных
- [ ] Скрипт миграции существующих карт
- [ ] Проверка целостности данных
- [ ] Откат план в случае проблем

### Этап 3: Переключение
- [ ] Feature flag для новой системы
- [ ] Постепенное переключение пользователей
- [ ] Мониторинг производительности

### Этап 4: Очистка
- [ ] Удаление старых полей после подтверждения стабильности
- [ ] Оптимизация индексов
- [ ] Обновление документации

---

## 📊 Метрики успеха

### KPI для отслеживания:
- **Reduction in bandwidth usage:** >99% для terrain updates
- **Client memory usage:** <5MB активных данных карты
- **Delta delivery latency:** <50ms p95
- **Database query performance:** <10ms p95 для chunk operations
- **Client rendering FPS:** Stable 60fps во время updates

### Мониторинг:
```typescript
// TODO: Добавить метрики
interface MapOptimizationMetrics {
  chunkLoadsPerSecond: number;
  deltaUpdatesPerSecond: number;
  avgChunkLoadTime: number;
  avgDeltaDeliveryTime: number;
  activeChunksPerClient: number;
  memoryUsagePerClient: number;
}
```

---

## 🔗 Связанные задачи

- [ ] **#MAP-001:** Реализация MapChunk модели и сервисов
- [ ] **#MAP-002:** WebSocket оптимизация для delta updates
- [ ] **#MAP-003:** Клиентский менеджер чанков
- [ ] **#MAP-004:** Миграция существующих карт
- [ ] **#MAP-005:** Performance тестирование и бенчмарки
- [ ] **#MAP-006:** Мониторинг и алертинг для новой системы

---

## 📚 Дополнительные материалы

### Архитектурные решения
- AOI (Area of Interest) patterns в игровых системах
- Delta compression algorithms
- Spatial partitioning strategies
- Real-time synchronization patterns

### Технические референсы
- PostgreSQL JSONB performance optimization
- WebSocket broadcasting optimization
- Canvas rendering optimization для chunk-based maps
- Memory management для game clients

---

> **⚠️ Важно:** Данный план рефакторинга критично важен для масштабирования системы. Текущая архитектура не выдержит нагрузку от 100+ одновременных игроков на одной карте.

> **✅ Критерий готовности:** План можно считать выполненным, когда 1000+ игроков могут одновременно взаимодействовать с картой при стабильном FPS и задержке <50ms.