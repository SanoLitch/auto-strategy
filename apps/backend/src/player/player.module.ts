import { Module } from '@nestjs/common';
import { PlayerController } from './api/player.controller';
import { PlayerService } from './domain/player.service';
import { PlayerRepository } from './db/player.repository';

/**
 * Модуль игрока.
 */
@Module({
  controllers: [PlayerController],
  providers: [PlayerService, PlayerRepository],
  exports: [PlayerService, PlayerRepository],
})
export class PlayerModule {}
