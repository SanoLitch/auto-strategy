import { Injectable } from '@nestjs/common';
import {
  Prisma, GameSession as GameSessionDb,
} from '@prisma/client';
import { DbService } from '../../core/db/db.service';

@Injectable()
export class GameSessionRepository {
  constructor(private readonly db: DbService) {}

  public async create(data: Prisma.GameSessionCreateInput): Promise<GameSessionDb> {
    return this.db.gameSession.create({ data });
  }

  public async update(
    sessionId: string,
    data: Prisma.GameSessionUpdateInput,
  ): Promise<GameSessionDb> {
    return this.db.gameSession.update({
      where: { id: sessionId },
      data,
    });
  }

  public async findById(sessionId: string): Promise<GameSessionDb> {
    return this.db.gameSession.findUniqueOrThrow({ where: { id: sessionId } });
  }
}
