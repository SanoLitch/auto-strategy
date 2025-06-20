import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GameSessionController } from './api/game-session.controller';
import { GameSessionService } from './domain/game-session.service';
import { GameSessionRepository } from './db/game-session.repository';
import { GameSessionGateway } from './api/game-session.gateway';
import { DbModule } from '../core/db';

@Module({
  imports: [DbModule, EventEmitterModule.forRoot()],
  controllers: [GameSessionController],
  providers: [
    GameSessionService,
    GameSessionRepository,
    GameSessionGateway,
  ],
  exports: [
    GameSessionService,
    GameSessionRepository,
    GameSessionGateway,
  ],
})
export class GameSessionModule {}
