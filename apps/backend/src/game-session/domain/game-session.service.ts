import {
  Injectable, Logger,
} from '@nestjs/common';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { GameSessionStatus } from './game-session.entity';
import { GameSessionRepository } from '../db/game-session.repository';
import { GameSessionMapper } from '../lib/game-session.mapper';
import { GameSessionDto } from '../api/game-session.dto';
import { GameSessionGateway } from '../api/game-session.gateway';

@Injectable()
export class GameSessionService {
  private readonly logger = new Logger(GameSessionService.name);

  constructor(
    private readonly gameSessionRepository: GameSessionRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly gameSessionGateway: GameSessionGateway,
  ) { }

  async createGameSession(): Promise<GameSessionDto> {
    this.logger.log('Create new game session');

    const sessionDb = await this.gameSessionRepository.create({
      status: GameSessionStatus.GeneratingMap,
      created_at: new Date(),
    });

    this.logger.log(`Game session created: id=${ sessionDb.id }`);
    this.logger.log(`Emit map.generate event for sessionId=${ sessionDb.id }`);

    this.eventEmitter.emit('map.generate', { sessionId: sessionDb.id });

    return GameSessionMapper.toDto(GameSessionMapper.toEntity(sessionDb));
  }

  @OnEvent('map.generated')
  async updateSessionAfterMapGenerated(sessionId: string, mapId: string): Promise<void> {
    this.logger.log(`Update session after map generated: sessionId=${ sessionId }, mapId=${ mapId }`);

    await this.gameSessionRepository.update(sessionId, {
      status: GameSessionStatus.Waiting,
    });

    this.logger.log(`Session updated: sessionId=${ sessionId }, mapId=${ mapId }`);

    this.onGameSessionChanged(sessionId);
  }

  async getGameSessionById(sessionId: string): Promise<GameSessionDto> {
    this.logger.log(`Get game session by id: ${ sessionId }`);

    const sessionDb = await this.gameSessionRepository.findById(sessionId);

    return GameSessionMapper.toDto(GameSessionMapper.toEntity(sessionDb));
  }

  @OnEvent('game-session.changed')
  async onGameSessionChanged(sessionId: string): Promise<void> {
    this.logger.log(`Game session changed: sessionId=${ sessionId }`);

    const dto = await this.getGameSessionById(sessionId);

    this.gameSessionGateway.emitGameStateUpdate(sessionId, dto);
  }
}
