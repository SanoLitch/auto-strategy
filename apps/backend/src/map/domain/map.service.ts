import {
  Injectable, Logger,
} from '@nestjs/common';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { type Vector2 } from '@libs/utils';
import { Worker } from 'worker_threads';
import {
  TerrainType,
} from './map.entity';
import { MapRepository } from '../db/map.repository';
import { MapDto } from '../api/map.dto';
import { MapMapper } from '../lib/map.mapper';
import { AppEventNames } from '../../core';

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);

  constructor(
    private readonly mapRepository: MapRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @OnEvent(AppEventNames.MAP_GENERATE)
  public async handleMapGenerateEvent(payload: {
    sessionId: string;
    size: Vector2;
    playersCount: number;
  }): Promise<void> {
    const {
      sessionId, playersCount, size,
    } = payload;

    this.logger.log(`Handle map.generate event:
    sessionId=${ sessionId },
    size=${ JSON.stringify(size) },
    playersCount=${ playersCount }`);

    const worker = new Worker(
      require.resolve('../lib/map-generation.worker'),
      {
        workerData: {
          size,
          playersCount,
        },
      },
    ); // тут можно столкнуть с backpressure, лучше избегать создание нового воркера при каждом событии, особенно если карта будет большая и тд, попробуй https://www.npmjs.com/package/piscina

    const result = await new Promise<{
      terrainData: TerrainType[][];
      spawnPoints: Vector2[];
    }>((resolve, reject) => {
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with code ${ code }`));
        }
      });
    });

    const map = MapMapper.toEntity({
      id: null,
      size: payload.size,
      gameSessionId: payload.sessionId,
      terrainData: result.terrainData,
      spawnPoints: result.spawnPoints,
    });

    const mapDb = await this.mapRepository.createMap(MapMapper.toPersistence(map, payload.sessionId));

    this.eventEmitter.emit(AppEventNames.MAP_GENERATED, payload.sessionId, mapDb.id);

    this.logger.log(`Map generated and saved for sessionId=${ payload.sessionId }`);
  }

  public async getMapById(id: string): Promise<MapDto> {
    this.logger.log(`Get map by id: ${ id }`);

    const mapDb = await this.mapRepository.findMapById(id);
    const map = MapMapper.toEntity(mapDb);

    return MapMapper.toDto(map);
  }
}
