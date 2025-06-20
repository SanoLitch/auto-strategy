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
}
