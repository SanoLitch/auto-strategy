export enum GameSessionStatus {
  GeneratingMap = 'GENERATING_MAP',
  Waiting = 'WAITING',
  InProgress = 'IN_PROGRESS',
  Finished = 'FINISHED',
}

export class GameSession {
  readonly id: string;
  readonly mapId: string | null;
  readonly status: GameSessionStatus;
  readonly createdAt: Date;
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
