/**
 * Репозиторий для работы с картами в базе данных через DbService.
 * Реализует методы создания, поиска по id и получения всех карт.
 */
import { Injectable } from '@nestjs/common';
import { Map as MapDb } from '@prisma/client';
import { DbService } from '../../db/db.service';

/**
 * Репозиторий для работы с картами в базе данных через DbService.
 */
@Injectable()
export class MapRepository {
  constructor(private readonly db: DbService) { }

  /**
   * Создать новую карту.
   * @param data Данные для создания карты
   */
  async createMap(data: Partial<MapDb>): Promise<MapDb> {
    return this.db.map.create({
      data: {
        size: data.size,
        terrain_data: data.terrain_data,
        spawn_points: data.spawn_points,
      },
    });
  }

  /**
   * Найти карту по идентификатору.
   * @param id UUID карты
   */
  async findMapById(id: string): Promise<MapDb | null> {
    return this.db.map.findUniqueOrThrow({ where: { id } });
  }
}
