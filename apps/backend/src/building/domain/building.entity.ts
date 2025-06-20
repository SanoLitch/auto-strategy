export class Building {
  readonly id: string;
  readonly playerId: string;
  readonly type: string;
  readonly position: Record<string, number>;
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
