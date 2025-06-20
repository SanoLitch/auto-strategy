import { Injectable } from '@nestjs/common';
import {
  Prisma, GameSession as GameSessionDb,
} from '@prisma/client';
import { DbService } from '../../db/db.service';

/**
 * Репозиторий для работы с игровыми сессиями в базе данных.
 */
@Injectable()
export class GameSessionRepository {
  constructor(private readonly db: DbService) {}

  /**
   * Создать новую игровую сессию.
   */
  public async create(data: Prisma.GameSessionCreateInput): Promise<GameSessionDb> {
    return this.db.gameSession.create({ data });
  }

  /**
   * Обновить игровую сессию по id.
   */
  public async update(
    sessionId: string,
    data: Prisma.GameSessionUpdateInput,
  ): Promise<GameSessionDb> {
    return this.db.gameSession.update({
      where: { id: sessionId },
      data,
    });
  }

  /**
   * Найти игровую сессию по id.
   */
  public async findById(sessionId: string): Promise<GameSessionDb> {
    return this.db.gameSession.findUniqueOrThrow({ where: { id: sessionId } });
  }
}
