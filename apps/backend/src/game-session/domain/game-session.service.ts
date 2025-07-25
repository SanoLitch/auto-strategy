import {
  Injectable, Logger,
} from '@nestjs/common';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { Uuid } from '@libs/domain-primitives';
import { type Vector2 } from '@libs/utils';
import { GameSession } from './game-session.entity';
import { GameSessionRepository } from '../db/game-session.repository';
import { GameSessionMapper } from '../lib/game-session.mapper';
import { GameSessionDto } from '../api/game-session.dto';
import { GameSessionGateway } from '../api/game-session.gateway';
import {
  AppEventNames, AppEvents,
} from '../../core';

@Injectable()
export class GameSessionService {
  private readonly logger = new Logger(GameSessionService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly gameSessionGateway: GameSessionGateway,
    private readonly gameSessionRepository: GameSessionRepository,
  ) { }

  public async createGameSession(size: number, playersCount: number): Promise<GameSessionDto> {
    this.logger.log('Create new game session');

    const session = GameSession.create();
    const sessionDb = GameSessionMapper.toPersistence(session);

    await this.gameSessionRepository.create(sessionDb);

    this.logger.log(`Game session created: id=${ session.id.getValue() }`);
    this.logger.log(`Emit map.generate event for sessionId=${ session.id.getValue() }`);

    this.eventEmitter.emit(AppEventNames.MAP_GENERATE, {
      sessionId: session.id.getValue(),
      size: {
        x: size,
        y: size,
      } satisfies Vector2,
      playersCount,
    } satisfies AppEvents[AppEventNames.MAP_GENERATE]);

    return GameSessionMapper.toDto(session);
  }

  @OnEvent(AppEventNames.MAP_GENERATED)
  public async handleMapGenerated(sessionId: string, mapId: string): Promise<void> {
    this.logger.log(`Update session after map generated: sessionId=${ sessionId }, mapId=${ mapId }`);

    try {
      await this.gameSessionRepository.update(sessionId, { status: 'WAITING' });
    } catch (e) {
      this.logger.error(`Unable to set session in status, sessionId=${ sessionId }, status=${ mapId }`);
      throw e;
    }
    this.logger.log(`Session updated: sessionId=${ sessionId }, mapId=${ mapId }`);

    this.onGameSessionChanged(sessionId);
  }

  public async requestToJoinSession(userId: string, sessionId: string): Promise<void> {
    this.logger.log(`User ${ userId } requesting to join session ${ sessionId }`);

    const sessionDb = await this.gameSessionRepository.findById(sessionId);
    const session = GameSessionMapper.toEntity(sessionDb);

    session.canAddPlayer(new Uuid(userId));

    this.logger.log(`Session validated for joining. Emitting player.joining for user ${ userId }`);

    this.eventEmitter.emit(AppEventNames.PLAYER_JOINING, {
      userId,
      gameSessionId: sessionId,
    } satisfies AppEvents[AppEventNames.PLAYER_JOINING]);
  }

  @OnEvent(AppEventNames.PLAYER_CREATED)
  public async handlePlayerCreated(sessionId: string): Promise<void> {
    this.logger.log(`Received player.created event for session ${ sessionId }. Triggering update.`);

    await this.onGameSessionChanged(sessionId);
  }

  public async getGameSessionById(sessionId: string): Promise<GameSessionDto> {
    this.logger.log(`Get game session by id: ${ sessionId }`);

    const sessionDb = await this.gameSessionRepository.findById(sessionId);
    const session = GameSessionMapper.toEntity(sessionDb);

    return GameSessionMapper.toDto(session);
  }

  @OnEvent(AppEventNames.GAME_SESSION_CHANGED)
  public async onGameSessionChanged(sessionId: string): Promise<void> {
    this.logger.log(`Game session changed: sessionId=${ sessionId }`);

    const dto = await this.getGameSessionById(sessionId);

    this.gameSessionGateway.emitGameStateUpdate(sessionId, dto);
  }
}
