/**
 * Доменная сущность юнита.
 */
export class Unit {
  /** Уникальный идентификатор юнита */
  readonly id: string;
  /** Идентификатор игрока-владельца */
  readonly playerId: string;
  /** ID здания, которое создало юнита */
  readonly buildingId: string;
  /** Тип юнита */
  readonly type: string;
  /** Текущие координаты на карте */
  readonly position: Record<string, number>;
  /** Текущее здоровье юнита */
  readonly health: number;

  constructor(params: {
    id: string;
    playerId: string;
    buildingId: string;
    type: string;
    position: Record<string, number>;
    health: number;
  }) {
    this.id = params.id;
    this.playerId = params.playerId;
    this.buildingId = params.buildingId;
    this.type = params.type;
    this.position = params.position;
    this.health = params.health;
  }
}
