import { Uuid } from '@libs/domain-primitives';

export class Building {
  public readonly id: Uuid;
  public readonly playerId: Uuid;
  public readonly type: string;
  public readonly position: Record<string, number>;
  public readonly path?: Record<string, number>[];

  constructor(params: {
    id: Uuid;
    playerId: Uuid;
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
