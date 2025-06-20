import { Injectable } from '@nestjs/common';
import {
  Prisma, Player as PlayerDb,
} from '@prisma/client';
import { DbService } from '../../db';

@Injectable()
export class PlayerRepository {
  constructor(private readonly db: DbService) {}

  public async create(data: Prisma.PlayerCreateInput): Promise<PlayerDb> {
    return this.db.player.create({ data });
  }

  public async findById(id: string): Promise<PlayerDb> {
    return this.db.player.findUniqueOrThrow({ where: { id } });
  }

  public async findByUserAndSession(userId: string, gameSessionId: string): Promise<PlayerDb> {
    return this.db.player.findFirstOrThrow({ where: {
      user_id: userId,
      game_session_id: gameSessionId,
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
      data: { is_winner: isWinner },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.db.player.delete({ where: { id } });
  }
}
