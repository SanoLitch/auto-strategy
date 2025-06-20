/**
 * Доменная сущность игровой сессии.
 */
export class GameSession {
  /** Уникальный идентификатор сессии */
  readonly id: string;
  /** Идентификатор карты */
  readonly mapId: string;
  /** Статус игры */
  readonly status: string;
  /** Дата создания */
  readonly createdAt: Date;
  /** Дата завершения */
  readonly finishedAt?: Date;

  constructor(params: {
    id: string;
    mapId: string;
    status: string;
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
