export class Unit {
  readonly id: string;
  readonly playerId: string;
  readonly buildingId: string;
  readonly type: string;
  readonly position: Record<string, number>;
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
