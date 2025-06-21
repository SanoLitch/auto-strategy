import { Injectable } from '@nestjs/common';
import { Map as MapDb } from '@prisma/client';
import { DbService } from '../../core/db/db.service';

@Injectable()
export class MapRepository {
  constructor(private readonly db: DbService) { }

  async createMap(gameSessionId: string, data: Partial<MapDb>): Promise<MapDb> {
    return this.db.map.create({
      data: {
        game_session: gameSessionId,
        size: data.size,
        terrain_data: data.terrain_data,
        spawn_points: data.spawn_points,
      },
    });
  }

  async findMapById(id: string): Promise<MapDb | null> {
    return this.db.map.findUniqueOrThrow({ where: { id } });
  }
}
