import {
  Injectable, Logger,
} from '@nestjs/common';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { Uuid } from '@libs/domain-primitives';
import { Player } from './player.entity';
import { PlayerRepository } from '../db/player.repository';
import { PlayerMapper } from '../lib/player.mapper';
import { PlayerDto } from '../api/player.dto';
import {
  AppEventNames, AppEvents,
} from '../../core';

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(AppEventNames.PLAYER_JOINING)
  public async handlePlayerCreateRequest(
    payload: { userId: string; gameSessionId: string },
  ): Promise<void> {
    const {
      userId, gameSessionId,
    } = payload;

    this.logger.log(
      `Handling player.joining: userId=${ userId }, gameSessionId=${ gameSessionId }`,
    );

    try {
      await this.playerRepository.findByUserAndSession(userId, gameSessionId);

      this.logger.warn(
        `Player already exists, ignoring creation request: userId=${ userId }, gameSessionId=${ gameSessionId }`,
      );
      return;
    } catch (err) {
      this.logger.log(
        `Player not found, can join to gameSessionId=${ gameSessionId }`,
      );
    }

    const playerEntity = Player.create({
      userId: new Uuid(userId),
      gameSessionId: new Uuid(gameSessionId),
    });

    const playerDb = await this.playerRepository.create(
      PlayerMapper.toPersistence(playerEntity),
    );

    this.logger.log(`Player created: id=${ playerDb.id }`);

    this.eventEmitter.emit(AppEventNames.PLAYER_CREATED, gameSessionId);
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
