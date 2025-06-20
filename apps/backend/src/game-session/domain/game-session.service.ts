/**
 * Доменный сервис для работы с игровыми сессиями.
 * Реализует бизнес-логику создания и обновления сессии согласно аналитике.
 */
import { Injectable } from '@nestjs/common';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { Uuid } from '@libs/domain-primitives';
import {
  GameSession, GameSessionStatus,
} from './game-session.entity';
import { GameSessionRepository } from '../db/game-session.repository';
import { GameSessionMapper } from '../lib/game-session.mapper';
import { GameSessionDto } from '../api/game-session.dto';
import { GameSessionGateway } from '../api/game-session.gateway';
/*
 * Импортировать MapService из map/domain/map.service, когда он будет реализован
 * import { MapService } from '../../../map/domain/map.service';
 */

@Injectable()
export class GameSessionService {
  constructor(
    private readonly gameSessionRepository: GameSessionRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly gameSessionGateway: GameSessionGateway,
    // private readonly mapService: MapService, // Для генерации карты
  ) {}

  /**
   * Создать новую игровую сессию (асинхронно инициирует генерацию карты).
   * @returns Promise<GameSessionDto>
   */
  async createGameSession(): Promise<GameSessionDto> {
    const sessionDb = await this.gameSessionRepository.create({
      map_id: null,
      status: GameSessionStatus.GeneratingMap,
      created_at: new Date(),
    });

    // Отправить событие генерации карты (заглушка)
    this.eventEmitter.emit('map.generate', { sessionId: sessionDb.id });

    return GameSessionMapper.toDto(GameSessionMapper.toEntity(sessionDb));
  }

  /**
   * Обновить сессию после генерации карты (проставить mapId, статус WAITING).
   * @param sessionId string
   * @param mapId string
   * @returns Promise<GameSessionDto>
   */
  @OnEvent('map.generated')
  async updateSessionAfterMapGenerated(sessionId: string, mapId: string): Promise<GameSessionDto> {
    const sessionDb = await this.gameSessionRepository.update(sessionId, {
      map_id: mapId,
      status: GameSessionStatus.Waiting,
    });
    const dto = GameSessionMapper.toDto(GameSessionMapper.toEntity(sessionDb));

    this.gameSessionGateway.emitGameStateUpdate(sessionId, dto);

    return dto;
  }

  /**
   * Получить игровую сессию по id.
   * @param sessionId string
   * @returns Promise<GameSessionDto>
   */
  async getGameSessionById(sessionId: string): Promise<GameSessionDto> {
    const sessionDb = await this.gameSessionRepository.findById(sessionId);

    return GameSessionMapper.toDto(GameSessionMapper.toEntity(sessionDb));
  }
}
