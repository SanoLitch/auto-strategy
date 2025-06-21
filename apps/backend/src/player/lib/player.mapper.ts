import { Player as PlayerDb } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import { Player } from '../domain/player.entity';
import { PlayerDto } from '../api/player.dto';

export class PlayerMapper {
  public static toEntity(db: PlayerDb): Player {
    return new Player({
      id: new Uuid(db.id),
      userId: new Uuid(db.userId),
      gameSessionId: new Uuid(db.gameSessionId),
      resources: db.resources as Record<string, number>,
      isWinner: db.isWinner ?? undefined,
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
      userId: entity.userId.getValue(),
      gameSessionId: entity.gameSessionId.getValue(),
      resources: entity.resources,
      isWinner: entity.isWinner,
    };
  }
}
