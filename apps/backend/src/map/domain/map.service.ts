/**
 * Доменный сервис для работы с картами.
 * Инкапсулирует бизнес-логику генерации и получения карт.
 */
import { Injectable } from '@nestjs/common';
import { Uuid } from '@libs/domain-primitives';
import {
  EventEmitter2, OnEvent,
} from '@nestjs/event-emitter';
import { Worker } from 'worker_threads';
import {
  Map, MapSize,
  SpawnPoint,
  TerrainType,
} from './map.entity';
import { MapRepository } from '../db/map.repository';
import { MapDto } from '../api/map.dto';
import { MapMapper } from '../lib/map.mapper';

interface MapGenerateEventPayload {
  sessionId: string;
  size: { width: number; height: number };
  playersCount: number;
}

@Injectable()
export class MapService {
  constructor(
    private readonly mapRepository: MapRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  @OnEvent('map.generate')
  async handleMapGenerateEvent(payload: MapGenerateEventPayload) {
    const worker = new Worker(
      require.resolve('../lib/map-generation.worker'),
      {
        workerData: {
          size: payload.size,
          playersCount: payload.playersCount,
        },
      },
    );

    const result = await new Promise<{ terrainData: TerrainType[][]; spawnPoints: SpawnPoint[] }>((resolve, reject) => {
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) reject(new Error(`Worker stopped with code ${ code }`));
      });
    });

    const map = new Map({
      id: new Uuid(),
      size: MapSize.fromJSON(payload.size),
      terrainData: result.terrainData,
      spawnPoints: result.spawnPoints,
    });
    const mapDb = await this.mapRepository.createMap(MapMapper.toPersistence(map));

    this.eventEmitter.emit('map.generated', new Uuid(payload.sessionId), new Uuid(mapDb.id));
  }

  /**
   * Получить карту по идентификатору.
   * @param id UUID карты
   */
  async getMapById(id: string): Promise<MapDto> {
    const mapDb = await this.mapRepository.findMapById(id);

    const map = MapMapper.toEntity(mapDb);

    return MapMapper.toDto(map);
  }
}
