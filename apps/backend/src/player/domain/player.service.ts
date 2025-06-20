/**
 * Доменный сервис для работы с игроками.
 * TODO: Реализовать бизнес-логику игрока.
 */
import {
  Injectable, ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Player } from './player.entity';
import { PlayerRepository } from '../db/player.repository';
import { PlayerMapper } from '../lib/player.mapper';
import { CreatePlayerDto } from '../api/create-player.dto';
import { PlayerDto } from '../api/player.dto';

@Injectable()
export class PlayerService {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Создать нового игрока (при присоединении к сессии).
   */
  public async createPlayer(userId: string, gameSessionId: string): Promise<PlayerDto> {
    // Проверка на уникальность игрока в сессии
    try {
      await this.playerRepository.findByUserAndSession(userId, gameSessionId);
      throw new ConflictException('Player already exists in this session');
    } catch (err) {
      // Ожидаемое поведение: не найден — создаём
    }
    const entity = Player.create({
      userId,
      gameSessionId,
    });
    const dbModel = await this.playerRepository.create(PlayerMapper.toCreateInput(entity));

    this.eventEmitter.emit('game-session.changed', gameSessionId);

    return PlayerMapper.toDto(PlayerMapper.toEntity(dbModel));
  }

  /**
   * Получить игрока по id.
   */
  public async getById(id: string): Promise<PlayerDto> {
    const dbModel = await this.playerRepository.findById(id);

    return PlayerMapper.toDto(PlayerMapper.toEntity(dbModel));
  }

  /**
   * Удалить игрока.
   */
  public async delete(id: string): Promise<void> {
    await this.playerRepository.delete(id);
  }
}
