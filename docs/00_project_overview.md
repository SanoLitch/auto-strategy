# Обзор проекта Auto Strategy

## Описание

Auto Strategy - это многопользовательская стратегическая игра, где игроки управляют автоматизированными юнитами для исследования карты, добычи ресурсов и противостояния противникам.

## Основные особенности

- **Автоматизированное управление**: Юниты действуют автоматически по заданным путям
- **Real-time взаимодействие**: WebSocket для мгновенных обновлений
- **Исследование карты**: Система "тумана войны" с постепенным открытием территории
- **Ресурсная экономика**: Добыча и управление ресурсами (золото, кристаллы)
- **Стратегическое планирование**: Размещение зданий и прокладывание путей

## Архитектура

### Monorepo структура

```
auto-strategy/
├── apps/
│   ├── backend/          # NestJS API сервер
│   └── frontend/         # React клиент
├── libs/                 # Общие библиотеки
│   ├── domain-primitives/ # Value Objects
│   ├── nest-jwt/         # JWT аутентификация
│   ├── logger/           # Логирование
│   └── utils/            # Утилиты
└── docs/                 # Документация проекта
```

### Backend модули

- **User**: Аутентификация и управление пользователями
- **GameSession**: Игровые сессии и их жизненный цикл
- **Map**: Генерация и управление игровыми картами
- **Player**: Игроки в сессиях и их ресурсы
- **Building**: Здания и их производство
- **Unit**: Юниты и их автоматизация

## Технологический стек

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: JWT с HttpOnly cookies
- **WebSocket**: Socket.io для real-time обновлений
- **Validation**: class-validator и class-transformer
- **Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: React с TypeScript
- **Build Tool**: Vite
- **State Management**: React Context + Hooks
- **Styling**: CSS Modules

### Общие

- **Package Manager**: pnpm
- **Monorepo**: Turborepo
- **Testing**: Jest
- **Linting**: ESLint

## API Endpoints

### Аутентификация

- `POST /v1/users` - Регистрация
- `POST /v1/users/login` - Вход в систему
- `GET /v1/users/me` - Профиль пользователя

### Игровые сессии

- `POST /v1/sessions` - Создание сессии
- `GET /v1/sessions/{id}` - Получение сессии
- `POST /v1/sessions/{id}/players` - Присоединение к сессии
- `POST /v1/sessions/{id}/buildings` - Строительство зданий

## Статусы игровых сессий

- `GENERATING_MAP` - Карта генерируется
- `WAITING` - Ожидание игроков
- `IN_PROGRESS` - Игра в процессе
- `FINISHED` - Игра завершена

## WebSocket события

- `map.generate` - Запуск генерации карты
- `map.generated` - Карта сгенерирована
- `player.created` - Создан новый игрок
- `player.joining` - Игрок присоединяется
- `game-session.changed` - Изменение состояния сессии

## Последние обновления

### Исправления документации (текущая сессия)

- ✅ Исправлены пути API аутентификации (`/v1/users` вместо `/api/v1/auth/*`)
- ✅ Обновлены статусы игровых сессий согласно реальной реализации
- ✅ Исправлено описание PlayerDto (isWinner как Boolean, а не Boolean | undefined)
- ✅ Обновлено описание MapDto с корректными типами spawnPoints
- ✅ Исправлены WebSocket события согласно реальной реализации
- ✅ Обновлена архитектурная документация с актуальной структурой модулей
- ✅ Добавлен кастомный декоратор `@UserId()` для извлечения ID пользователя из JWT токена

## Разработка

### Установка зависимостей

```bash
pnpm install
```

### Запуск в development режиме

```bash
# Backend
pnpm --filter backend dev

# Frontend
pnpm --filter frontend dev
```

### Сборка проекта

```bash
pnpm build
```

## Документация

- [Игровая механика](01_game_mechanics.md)
- [Модели данных](02_data_models.md)
- [Архитектура системы](03_system_architecture.md)
- [Спецификация API](04_api_specification.md)
- [Аналитика аутентификации](05_auth_analytics.md)
- [Аналитика игровых сессий](06_game_session_analytics.md)
- [Аналитика карт](07_map_analytics.md)
- [Аналитика игроков](08_player_analytics.md)
- **[План рефакторинга системы карт](09_map_optimization_refactoring_plan.md)** ⚠️ TODO
