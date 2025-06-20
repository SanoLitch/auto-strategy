/**
 * Маппер для преобразования данных игрока между слоями.
 * TODO: Реализовать методы преобразования.
 */
import {
  Player as PlayerDb, Prisma,
} from '@prisma/client';
import { Player } from '../domain/player.entity';
import { PlayerDto } from '../api/player.dto';

export class PlayerMapper {
  /**
   * Преобразовать Prisma-модель в доменную сущность.
   */
  public static toEntity(db: PlayerDb): Player {
    return new Player({
      id: db.id,
      userId: db.user_id,
      gameSessionId: db.game_session_id,
      resources: db.resources as Record<string, number>,
      isWinner: db.is_winner ?? undefined,
    });
  }

  /**
   * Преобразовать доменную сущность в DTO.
   */
  public static toDto(entity: Player): PlayerDto {
    return {
      id: entity.id,
      userId: entity.userId,
      gameSessionId: entity.gameSessionId,
      resources: entity.resources,
      isWinner: entity.isWinner,
    };
  }

  /**
   * Преобразовать доменную сущность в Prisma-модель (для создания/обновления).
   */
  public static toPersistence(entity: Player): Partial<PlayerDb> {
    return {
      id: entity.id,
      user_id: entity.userId,
      game_session_id: entity.gameSessionId,
      resources: entity.resources,
      is_winner: entity.isWinner,
    };
  }

  /**
   * Преобразовать доменную сущность в Prisma-модель для создания (PlayerCreateInput).
   */
  public static toCreateInput(entity: Player): Prisma.PlayerCreateInput {
    return {
      id: entity.id,
      user_id: entity.userId,
      game_session_id: entity.gameSessionId,
      resources: entity.resources,
      is_winner: entity.isWinner,
    };
  }
}
