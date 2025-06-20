import { Module } from '@nestjs/common';
import { BuildingController } from './api/building.controller';
import { BuildingService } from './domain/building.service';
import { BuildingRepository } from './db/building.repository';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService, BuildingRepository],
  exports: [BuildingService, BuildingRepository],
})
export class BuildingModule {}
