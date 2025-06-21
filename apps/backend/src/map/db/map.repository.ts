import { Injectable } from '@nestjs/common';
import { Map as MapDb } from '@prisma/client';
import { DbService } from '../../core/db/db.service';

@Injectable()
export class MapRepository {
  constructor(private readonly db: DbService) { }

  public async createMap(data: MapDb): Promise<MapDb> {
    return this.db.map.create({
      data: {
        size: data.size,
        terrainData: data.terrainData,
        spawnPoints: data.spawnPoints,
        gameSession: {
          connect: {
            id: data.gameSessionId,
          },
        },
      },
    });
  }

  public async findMapById(id: string): Promise<MapDb | null> {
    return this.db.map.findUniqueOrThrow({ where: { id } });
  }
}
