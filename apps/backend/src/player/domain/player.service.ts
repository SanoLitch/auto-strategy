import {
  Injectable, ConflictException, Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Player } from './player.entity';
import { PlayerRepository } from '../db/player.repository';
import { PlayerMapper } from '../lib/player.mapper';
import { PlayerDto } from '../api/player.dto';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async createPlayer(userId: string, gameSessionId: string): Promise<PlayerDto> {
    this.logger.log(`Create player: userId=${ userId }, gameSessionId=${ gameSessionId }`);

    try {
      await this.playerRepository.findByUserAndSession(userId, gameSessionId);

      this.logger.warn(`Player already exists: userId=${ userId }, gameSessionId=${ gameSessionId }`);

      throw new ConflictException('Player already exists in this session');
    } catch (err) {
      // Ожидаемое поведение: не найден — создаём
    }
    const entity = Player.create({
      userId,
      gameSessionId,
    });
    const dbModel = await this.playerRepository.create(PlayerMapper.toPersistence(entity));

    this.eventEmitter.emit('game-session.changed', gameSessionId);

    this.logger.log(`Player created: userId=${ userId }, gameSessionId=${ gameSessionId }`);

    return PlayerMapper.toDto(PlayerMapper.toEntity(dbModel));
  }

  public async getById(id: string): Promise<PlayerDto> {
    this.logger.log(`Get player by id: ${ id }`);
    const dbModel = await this.playerRepository.findById(id);

    return PlayerMapper.toDto(PlayerMapper.toEntity(dbModel));
  }

  public async delete(id: string): Promise<void> {
    this.logger.log(`Delete player: ${ id }`);

    await this.playerRepository.delete(id);

    this.logger.log(`Player deleted: ${ id }`);
  }
}
