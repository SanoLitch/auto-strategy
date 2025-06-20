import { GameSession as GameSessionDb } from '@prisma/client';
import {
  GameSession, GameSessionStatus,
} from '../domain/game-session.entity';
import { GameSessionDto } from '../api/game-session.dto';

/**
 * Маппер для преобразования данных игровой сессии между слоями.
 */
export class GameSessionMapper {
  /**
   * Преобразовать Prisma-модель в доменную сущность.
   */
  public static toEntity(db: GameSessionDb): GameSession {
    return new GameSession({
      id: db.id,
      mapId: db.map_id ?? null,
      status: db.status as GameSessionStatus,
      createdAt: db.created_at,
      finishedAt: db.finished_at ?? undefined,
    });
  }

  /**
   * Преобразовать доменную сущность в Prisma-модель (для создания/обновления).
   */
  public static toPersistence(entity: GameSession): Partial<GameSessionDb> {
    return {
      id: entity.id,
      map_id: entity.mapId,
      status: entity.status,
      created_at: entity.createdAt,
      finished_at: entity.finishedAt,
    };
  }

  /**
   * Преобразовать доменную сущность в DTO для API.
   */
  public static toDto(entity: GameSession): GameSessionDto {
    return {
      id: entity.id,
      mapId: entity.mapId,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      finishedAt: entity.finishedAt ? entity.finishedAt.toISOString() : undefined,
    };
  }
}
