import {
  Player as PlayerDb, Prisma,
} from '@prisma/client';
import { Player } from '../domain/player.entity';
import { PlayerDto } from '../api/player.dto';

export class PlayerMapper {
  public static toEntity(db: PlayerDb): Player {
    return new Player({
      id: db.id,
      userId: db.user_id,
      gameSessionId: db.game_session_id,
      resources: db.resources as Record<string, number>,
      isWinner: db.is_winner ?? undefined,
    });
  }

  public static toDto(entity: Player): PlayerDto {
    return {
      id: entity.id,
      userId: entity.userId,
      gameSessionId: entity.gameSessionId,
      resources: entity.resources,
      isWinner: entity.isWinner,
    };
  }

  public static toPersistence(entity: Player): Partial<PlayerDb> {
    return {
      id: entity.id,
      user_id: entity.userId,
      game_session_id: entity.gameSessionId,
      resources: entity.resources,
      is_winner: entity.isWinner,
    };
  }

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
