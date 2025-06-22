import { Uuid } from '@libs/domain-primitives';
import {
  SessionNotWaitingError,
  MapNotGeneratedError,
  PlayerAlreadyJoinedError,
  SessionIsFullError,
  SessionIsEmptyError,
  SessionStartInWrongStatusError,
} from '@libs/utils';
import { Player } from '../../player/domain/player.entity';
import { Map } from '../../map/domain/map.entity';

export enum GameSessionStatus {
  GeneratingMap = 'GENERATING_MAP',
  Waiting = 'WAITING',
  InProgress = 'IN_PROGRESS',
  Finished = 'FINISHED',
}

export class GameSession {
  public readonly id: Uuid;
  public status: GameSessionStatus;
  public readonly createdAt: Date;
  public finishedAt?: Date;

  private _map: Map | null;
  private _players: Player[];

  constructor(params: {
    id: Uuid;
    status: GameSessionStatus;
    createdAt: Date;
    players: Player[];
    map: Map | null;
    finishedAt?: Date;
  }) {
    this.id = params.id;
    this.status = params.status;
    this.createdAt = params.createdAt;
    this._players = params.players;
    this._map = params.map;
    this.finishedAt = params.finishedAt;
  }

  public get mapId(): Uuid | null {
    return this._map?.id ?? null;
  }

  public get players(): readonly Player[] {
    return this._players;
  }

  public get map(): Readonly<Map> | null {
    return this._map;
  }

  public static create(): GameSession {
    return new GameSession({
      id: new Uuid(),
      status: GameSessionStatus.GeneratingMap,
      createdAt: new Date(),
      players: [],
      map: null,
    });
  }

  public canAddPlayer(userId: Uuid): void {
    if (this.status !== GameSessionStatus.Waiting) {
      throw new SessionNotWaitingError(this.status);
    }
    if (!this._map) {
      throw new MapNotGeneratedError();
    }
    if (this._players.some(p => p.userId.getValue() === userId.getValue())) {
      throw new PlayerAlreadyJoinedError(userId.getValue());
    }
    if (this._players.length >= this._map.spawnPoints.length) {
      throw new SessionIsFullError(this._map.spawnPoints.length);
    }
  }

  public startGame(): void {
    if (this.status !== GameSessionStatus.Waiting) {
      throw new SessionStartInWrongStatusError(this.id.getValue(), this.status);
    }
    if (this.players.length === 0) {
      throw new SessionIsEmptyError(this.id.getValue());
    }
    this.status = GameSessionStatus.InProgress;
  }

  public finish(): void {
    if (this.status === GameSessionStatus.Finished) {
      return;
    };
    this.status = GameSessionStatus.Finished;
    this.finishedAt = new Date();
  }
}
