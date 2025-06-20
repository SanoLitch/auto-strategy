import { Module } from '@nestjs/common';
import { UnitController } from './api/unit.controller';
import { UnitService } from './domain/unit.service';
import { UnitRepository } from './db/unit.repository';

@Module({
  controllers: [UnitController],
  providers: [UnitService, UnitRepository],
  exports: [UnitService, UnitRepository],
})
export class UnitModule {}
