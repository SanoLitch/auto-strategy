/**
 * Перечисление статусов игровой сессии.
 */
export enum GameSessionStatus {
  GeneratingMap = 'GENERATING_MAP',
  Waiting = 'WAITING',
  InProgress = 'IN_PROGRESS',
  Finished = 'FINISHED',
}

/**
 * Доменная сущность игровой сессии.
 * См. docs/06_game_session_analytics.md
 */
export class GameSession {
  /** Уникальный идентификатор сессии */
  readonly id: string;
  /** Идентификатор карты (может быть null до генерации) */
  readonly mapId: string | null;
  /** Статус игры */
  readonly status: GameSessionStatus;
  /** Дата создания */
  readonly createdAt: Date;
  /** Дата завершения */
  readonly finishedAt?: Date;

  constructor(params: {
    id: string;
    mapId: string | null;
    status: GameSessionStatus;
    createdAt: Date;
    finishedAt?: Date;
  }) {
    this.id = params.id;
    this.mapId = params.mapId;
    this.status = params.status;
    this.createdAt = params.createdAt;
    this.finishedAt = params.finishedAt;
  }
}
