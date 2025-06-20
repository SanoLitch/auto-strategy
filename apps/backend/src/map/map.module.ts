import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MapController } from './api/map.controller';
import { MapService } from './domain/map.service';
import { MapRepository } from './db/map.repository';
import { DbModule } from '../core/db';

@Module({
  imports: [DbModule, EventEmitterModule],
  controllers: [MapController],
  providers: [MapService, MapRepository],
  exports: [MapService, MapRepository],
})
export class MapModule {}
