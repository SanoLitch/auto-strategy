import { Uuid } from '@libs/domain-primitives';

export class Unit {
  public readonly id: Uuid;
  public readonly playerId: Uuid;
  public readonly buildingId: Uuid;
  public readonly type: string;
  public readonly position: Record<string, number>;
  public readonly health: number;

  constructor(params: {
    id: Uuid;
    playerId: Uuid;
    buildingId: Uuid;
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
