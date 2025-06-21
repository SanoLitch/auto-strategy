import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PlayerController } from './api/player.controller';
import { PlayerService } from './domain/player.service';
import { PlayerRepository } from './db/player.repository';
import { DbModule } from '../core/db';

@Module({
  imports: [DbModule, EventEmitterModule],
  controllers: [PlayerController],
  providers: [PlayerService, PlayerRepository],
  exports: [PlayerService, PlayerRepository],
})
export class PlayerModule {}
