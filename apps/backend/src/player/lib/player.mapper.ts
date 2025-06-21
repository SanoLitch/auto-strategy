import { Player as PlayerDb } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import { Player } from '../domain/player.entity';
import { PlayerDto } from '../api/player.dto';

export class PlayerMapper {
  public static toEntity(db: PlayerDb): Player {
    return new Player({
      id: new Uuid(db.id),
      userId: new Uuid(db.user_id),
      gameSessionId: new Uuid(db.game_session_id),
      resources: db.resources as Record<string, number>,
      isWinner: db.is_winner ?? undefined,
    });
  }

  public static toDto(entity: Player): PlayerDto {
    return {
      id: entity.id.getValue(),
      userId: entity.userId.getValue(),
      gameSessionId: entity.gameSessionId.getValue(),
      resources: entity.resources,
      isWinner: entity.isWinner,
    };
  }

  public static toPersistence(entity: Player): PlayerDb {
    return {
      id: entity.id.getValue(),
      user_id: entity.userId.getValue(),
      game_session_id: entity.gameSessionId.getValue(),
      resources: entity.resources,
      is_winner: entity.isWinner,
    };
  }
}
