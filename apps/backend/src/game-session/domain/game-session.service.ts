import {
  Injectable, Logger,
} from '@nestjs/common';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { Uuid } from '@libs/domain-primitives';
import { GameSession } from './game-session.entity';
import { GameSessionRepository } from '../db/game-session.repository';
import { GameSessionMapper } from '../lib/game-session.mapper';
import { GameSessionDto } from '../api/game-session.dto';
import { GameSessionGateway } from '../api/game-session.gateway';

@Injectable()
export class GameSessionService {
  private readonly logger = new Logger(GameSessionService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly gameSessionGateway: GameSessionGateway,
    private readonly gameSessionRepository: GameSessionRepository,
  ) { }

  public async createGameSession(): Promise<GameSessionDto> {
    this.logger.log('Create new game session');

    const session = GameSession.create();
    const persistenceModel = GameSessionMapper.toPersistenceForCreate(session);

    await this.gameSessionRepository.create(persistenceModel);

    this.logger.log(`Game session created: id=${ session.id.getValue() }`);
    this.logger.log(`Emit map.generate event for sessionId=${ session.id.getValue() }`);

    this.eventEmitter.emit('map.generate', { sessionId: session.id.getValue() });

    return GameSessionMapper.toDto(session);
  }

  @OnEvent('map.generated')
  public async handleMapGenerated({
    sessionId, mapId,
  }: { sessionId: string; mapId: string }): Promise<void> {
    this.logger.log(`Update session after map generated: sessionId=${ sessionId }, mapId=${ mapId }`);

    try {
      await this.gameSessionRepository.setMap(sessionId, mapId);
    } catch (e) {
      this.logger.error(`Unable to set map to session, sessionId=${ sessionId }, mapId=${ mapId }`);
      return;
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

    this.eventEmitter.emit('player.joining', {
      userId,
      gameSessionId: sessionId,
    });
  }

  @OnEvent('player.created')
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

  @OnEvent('game-session.changed')
  public async onGameSessionChanged(sessionId: string): Promise<void> {
    this.logger.log(`Game session changed: sessionId=${ sessionId }`);

    const dto = await this.getGameSessionById(sessionId);

    this.gameSessionGateway.emitGameStateUpdate(sessionId, dto);
  }
}
