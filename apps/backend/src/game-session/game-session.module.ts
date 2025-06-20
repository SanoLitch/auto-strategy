import { Module } from '@nestjs/common';
import { GameSessionController } from './api/game-session.controller';
import { GameSessionService } from './domain/game-session.service';
import { GameSessionRepository } from './db/game-session.repository';
import { GameSessionGateway } from './api/game-session.gateway';

/**
 * Модуль игровой сессии.
 */
@Module({
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
