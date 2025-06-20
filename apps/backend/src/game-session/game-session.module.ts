import { Module } from '@nestjs/common';
import { GameSessionController } from './api/game-session.controller';
import { GameSessionService } from './domain/game-session.service';
import { GameSessionRepository } from './db/game-session.repository';

/**
 * Модуль игровой сессии.
 */
@Module({
  controllers: [GameSessionController],
  providers: [GameSessionService, GameSessionRepository],
  exports: [GameSessionService, GameSessionRepository],
})
export class GameSessionModule {}
