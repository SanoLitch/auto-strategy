import { GameSession as GameSessionDb } from '@prisma/client';
import { Uuid } from '@libs/domain-primitives';
import {
  GameSession, GameSessionStatus,
} from '../domain/game-session.entity';
import { GameSessionDto } from '../api/game-session.dto';
import { GameSessionWithRelations } from '../db/game-session.repository';
import { PlayerMapper } from '../../player/lib/player.mapper';
import { MapMapper } from '../../map/lib/map.mapper';

export class GameSessionMapper {
  public static toEntity(sessionAggregateDb: GameSessionWithRelations): GameSession {
    const players = sessionAggregateDb.players.map(player => PlayerMapper.toEntity(player));
    const map = sessionAggregateDb.map ? MapMapper.toEntity(sessionAggregateDb.map) : null;

    return new GameSession({
      id: new Uuid(sessionAggregateDb.id),
      status: sessionAggregateDb.status as GameSessionStatus,
      createdAt: sessionAggregateDb.createdAt,
      finishedAt: sessionAggregateDb.finishedAt ?? undefined,
      players,
      map,
    });
  }

  public static toPersistence(entity: GameSession): GameSessionDb {
    return {
      id: entity.id.getValue(),
      status: entity.status,
      createdAt: entity.createdAt,
      finishedAt: entity.finishedAt ?? null,
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
