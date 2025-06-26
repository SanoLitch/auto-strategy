# Архитектура Системы

## 1. Обзор

Система построена на основе классической клиент-серверной архитектуры.

-   **Сервер (Backend):** Реализован на NestJS. Отвечает за всю игровую логику, обработку действий игроков, хранение состояния игры и персистентность данных. Является "источником правды" для состояния игры.
-   **Клиент (Frontend):** Реализован на React. Отвечает за визуализацию игрового мира (через Canvas), обработку пользовательского ввода и взаимодействие с сервером для получения обновлений и отправки команд.

```mermaid
graph TD;
    subgraph "Клиент (Браузер)"
        A[React UI]
        B[Zustand State]
        C[Canvas Renderer]
        D[Web Worker]
        E[API Client]
        A --> B;
        B --> C;
        C --> D;
        A --> E;
    end

    subgraph "Сервер (Бэкенд)"
        F[NestJS Application]
        G[Game Logic Service]
        H[REST API]
        I[WebSocket Gateway]
        J[Prisma ORM]
        F --> G;
        F --> H;
        F --> I;
        G --> J;
    end

    subgraph "Базы данных"
        K[PostgreSQL]
        L[Redis]
    end

    E -- REST / SSE --> H;
    E -- WebSocket --> I;
    I -- Pub/Sub --> L;
    J -- CRUD --> K;
    G -- Cache --> L;
```

## 2. Архитектура Backend

### 2.1. Структура модулей

```
src/
├── core/                    # Основные компоненты
│   ├── db/                 # База данных и миграции
│   ├── env.validation.ts   # Валидация переменных окружения
│   └── filters/            # Глобальные фильтры исключений
├── user/                   # Модуль пользователей
│   ├── api/               # Контроллеры и DTO
│   ├── domain/            # Бизнес-логика
│   ├── db/                # Репозиторий
│   └── lib/               # Мапперы
├── game-session/          # Модуль игровых сессий
│   ├── api/               # Контроллеры, DTO и WebSocket Gateway
│   ├── domain/            # Бизнес-логика
│   ├── db/                # Репозиторий
│   └── lib/               # Мапперы
├── map/                   # Модуль карт
│   ├── api/               # Контроллеры и DTO
│   ├── domain/            # Бизнес-логика
│   ├── db/                # Репозиторий
│   └── lib/               # Мапперы и генерация карт
├── player/                # Модуль игроков
│   ├── api/               # Контроллеры и DTO
│   ├── domain/            # Бизнес-логика
│   ├── db/                # Репозиторий
│   └── lib/               # Мапперы
├── building/              # Модуль зданий
│   ├── api/               # Контроллеры и DTO
│   ├── domain/            # Бизнес-логика
│   ├── db/                # Репозиторий
│   └── lib/               # Мапперы
└── unit/                  # Модуль юнитов
    ├── api/               # Контроллеры и DTO
    ├── domain/            # Бизнес-логика
    ├── db/                # Репозиторий
    └── lib/               # Мапперы
```

### 2.2. Технологический стек

- **Framework**: NestJS
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: JWT с HttpOnly cookies
- **WebSocket**: Socket.io для real-time обновлений
- **Validation**: class-validator и class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Pino

### 2.3. Паттерны архитектуры

#### Domain-Driven Design (DDD)
- **Entities**: User, GameSession, Player, Map, Building, Unit
- **Value Objects**: Uuid, PasswordHash
- **Services**: Бизнес-логика в domain слое
- **Repositories**: Доступ к данным через интерфейсы

#### Clean Architecture
- **API Layer**: Контроллеры и DTO
- **Domain Layer**: Бизнес-логика и сущности
- **Infrastructure Layer**: Репозитории и внешние сервисы

#### Event-Driven Architecture
- **App Events**: Система событий для асинхронной обработки
- **WebSocket Events**: Real-time обновления для клиентов

## 3. Схема взаимодействия (Пример)

Рассмотрим последовательность действий при постройке здания и создании первого юнита.

```mermaid
sequenceDiagram
    participant User as Пользователь
    participant Client as Клиент (React)
    participant Server as Сервер (NestJS)
    participant DB as База данных

    User->>Client: Кликает, чтобы построить Казарму в точке (x,y)
    Client->>Server: POST /api/sessions/{id}/buildings (type: 'BARRACKS', position: {x,y})
    activate Server
    Server->>DB: Проверить ресурсы игрока, создать запись о здании
    DB-->>Server: Запись создана
    Server-->>Client: 201 Created (объект нового здания)
    deactivate Server

    Client->>User: Отобразить здание на карте
    User->>Client: Рисует путь от Казармы
    Client->>Server: PUT /api/sessions/{id}/buildings/{b_id} (path: [...])
    activate Server
    Server->>DB: Обновить путь для здания
    DB-->>Server: Путь обновлен
    Server-->>Client: 200 OK
    deactivate Server

    loop Производство юнита
        Server->>Server: Таймер производит нового юнита (Warrior)
        Server->>DB: Создать запись о юните, списать ресурсы
        Server-->>Client: WebSocket event: 'unit_spawned' (данные юнита)
    end

    Client->>User: Отобразить нового юнита, который начинает двигаться по пути
```