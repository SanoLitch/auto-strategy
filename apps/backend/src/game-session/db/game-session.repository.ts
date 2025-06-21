import { Injectable } from '@nestjs/common';
import {
  Prisma, GameSession as GameSessionDb, Player as PlayerDb, Map as MapDb,
} from '@prisma/client';
import { DbService } from '../../core/db/db.service';

export type GameSessionWithRelations = GameSessionDb & {
  players: PlayerDb[];
  map: MapDb | null;
};

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

  public async setMap(
    sessionId: string,
    mapId: string,
  ): Promise<GameSessionDb> {
    return this.db.gameSession.update({
      where: { id: sessionId },
      data: {
        map: {
          connect: {
            id: mapId,
          },
        },
      },
    });
  }

  public async findById(sessionId: string): Promise<GameSessionWithRelations> {
    return this.db.gameSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: {
        players: true,
        map: true,
      },
    });
  }
}
