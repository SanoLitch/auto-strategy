import { randomUUID } from 'crypto';

/**
 * Доменная сущность игрока.
 */
export class Player {
  /** Уникальный идентификатор игрока */
  readonly id: string;
  /** Идентификатор пользователя */
  readonly userId: string;
  /** Идентификатор игровой сессии */
  readonly gameSessionId: string;
  /** Ресурсы игрока */
  readonly resources: Record<string, number>;
  /** Флаг победителя */
  readonly isWinner?: boolean;

  constructor(params: {
    id: string;
    userId: string;
    gameSessionId: string;
    resources: Record<string, number>;
    isWinner?: boolean;
  }) {
    this.id = params.id;
    this.userId = params.userId;
    this.gameSessionId = params.gameSessionId;
    this.resources = params.resources;
    this.isWinner = params.isWinner;
  }

  /**
   * Фабричный метод создания нового игрока с базовой валидацией и инициализацией ресурсов.
   */
  public static create(params: {
    userId: string;
    gameSessionId: string;
    resources?: Record<string, number>;
  }): Player {
    if (!params.userId) throw new Error('userId is required');
    if (!params.gameSessionId) throw new Error('gameSessionId is required');

    const resources = params.resources ?? {
      gold: 100,
      crystals: 0,
    };

    return new Player({
      id: randomUUID(),
      userId: params.userId,
      gameSessionId: params.gameSessionId,
      resources,
      isWinner: false,
    });
  }

  /**
   * Обновить ресурсы игрока (возвращает новый экземпляр).
   */
  public withResources(resources: Record<string, number>): Player {
    return new Player({
      ...this,
      resources,
    });
  }

  /**
   * Присвоить статус победителя (возвращает новый экземпляр).
   */
  public withWinner(isWinner: boolean = true): Player {
    return new Player({
      ...this,
      isWinner,
    });
  }
}
