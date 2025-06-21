import { Injectable } from '@nestjs/common';
import { Player as PlayerDb } from '@prisma/client';
import { DbService } from '../../core';

@Injectable()
export class PlayerRepository {
  constructor(private readonly db: DbService) {}

  public async create(data: PlayerDb): Promise<PlayerDb> {
    return this.db.player.create({ data });
  }

  public async findById(id: string): Promise<PlayerDb> {
    return this.db.player.findUniqueOrThrow({ where: { id } });
  }

  public async findByUserAndSession(userId: string, gameSessionId: string): Promise<PlayerDb> {
    return this.db.player.findFirstOrThrow({ where: {
      userId,
      gameSessionId,
    } });
  }

  public async updateResources(id: string, resources: Record<string, number>): Promise<PlayerDb> {
    return this.db.player.update({
      where: { id },
      data: { resources },
    });
  }

  public async setWinner(id: string, isWinner: boolean): Promise<PlayerDb> {
    return this.db.player.update({
      where: { id },
      data: { isWinner },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.db.player.delete({ where: { id } });
  }
}
