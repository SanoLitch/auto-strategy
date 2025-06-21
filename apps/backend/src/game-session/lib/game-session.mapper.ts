import { GameSession as GameSessionDb } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import { Prisma } from '@prisma/client';
import {
  GameSession, GameSessionStatus,
} from '../domain/game-session.entity';
import { GameSessionDto } from '../api/game-session.dto';
import { GameSessionWithRelations } from '../db/game-session.repository';
import { PlayerMapper } from '../../player/lib/player.mapper';
import { MapMapper } from '../../map/lib/map.mapper';

export class GameSessionMapper {
  public static toEntity(db: GameSessionWithRelations): GameSession {
    const players = db.players.map(p => PlayerMapper.toEntity(p));
    const map = db.map ? MapMapper.toEntity(db.map) : null;

    return new GameSession({
      id: new Uuid(db.id),
      status: db.status as GameSessionStatus,
      createdAt: db.createdAt,
      finishedAt: db.finishedAt ?? undefined,
      players,
      map,
    });
  }

  public static toPersistenceForCreate(entity: GameSession): Prisma.GameSessionCreateInput {
    return {
      id: entity.id.getValue(),
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }

  public static toPersistence(entity: GameSession): Partial<GameSessionDb> {
    return {
      id: entity.id.getValue(),
      status: entity.status,
      createdAt: entity.createdAt,
      finishedAt: entity.finishedAt,
    };
  }

  public static toDto(entity: GameSession): GameSessionDto {
    return {
      id: entity.id.getValue(),
      mapId: entity.mapId?.getValue() ?? null,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      finishedAt: entity.finishedAt ? entity.finishedAt.toISOString() : null,
    };
  }
}
