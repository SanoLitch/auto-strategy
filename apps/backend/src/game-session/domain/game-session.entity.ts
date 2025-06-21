import { Uuid } from '@libs/domain-primitives';
import {
  SessionNotWaitingError,
  MapNotGeneratedError,
  PlayerAlreadyJoinedError,
  SessionIsFullError,
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
  readonly id: Uuid;
  status: GameSessionStatus;
  readonly createdAt: Date;
  finishedAt?: Date;

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

  get mapId(): Uuid | null {
    return this._map?.id ?? null;
  }

  get players(): readonly Player[] {
    return this._players;
  }

  get map(): Readonly<Map> | null {
    return this._map;
  }

  static create(): GameSession {
    return new GameSession({
      id: new Uuid(),
      status: GameSessionStatus.GeneratingMap,
      createdAt: new Date(),
      players: [],
      map: null,
    });
  }

  public assignMap(map: Map): void {
    if (this.status !== GameSessionStatus.GeneratingMap) {
      throw new Error('Cannot assign map unless session is in GeneratingMap status.');
    }
    this._map = map;
    this.status = GameSessionStatus.Waiting;
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
      throw new Error('Cannot start game unless session is in Waiting status.');
    }
    // TODO: Add logic like checking for minimum number of players
    this.status = GameSessionStatus.InProgress;
  }

  public finish(): void {
    if (this.status === GameSessionStatus.Finished) return;
    this.status = GameSessionStatus.Finished;
    this.finishedAt = new Date();
  }
}
