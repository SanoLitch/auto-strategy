import { Module } from '@nestjs/common';
import { MapController } from './api/map.controller';
import { MapService } from './domain/map.service';
import { MapRepository } from './db/map.repository';

/**
 * Модуль карты.
 */
@Module({
  controllers: [MapController],
  providers: [MapService, MapRepository],
  exports: [MapService, MapRepository],
})
export class MapModule {}
