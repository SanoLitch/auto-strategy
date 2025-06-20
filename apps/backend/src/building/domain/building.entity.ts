/**
 * Доменная сущность здания.
 */
export class Building {
  /** Уникальный идентификатор здания */
  readonly id: string;
  /** Идентификатор игрока-владельца */
  readonly playerId: string;
  /** Тип здания */
  readonly type: string;
  /** Координаты на карте */
  readonly position: Record<string, number>;
  /** Путь для юнитов */
  readonly path?: Record<string, number>[];

  constructor(params: {
    id: string;
    playerId: string;
    type: string;
    position: Record<string, number>;
    path?: Record<string, number>[];
  }) {
    this.id = params.id;
    this.playerId = params.playerId;
    this.type = params.type;
    this.position = params.position;
    this.path = params.path;
  }
}
