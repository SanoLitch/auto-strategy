import {
  Controller, Get, Param, Logger,
} from '@nestjs/common';
import { MapDto } from './map.dto';
import { MapService } from '../domain/map.service';

@Controller('map')
export class MapController {
  private readonly logger = new Logger(MapController.name);

  constructor(private readonly mapService: MapService) {}

  @Get(':id')
  async getMapById(@Param('id') id: string): Promise<MapDto> {
    this.logger.log(`GET /map/${ id }`);

    return await this.mapService.getMapById(id);
  }

  @Get('admin/test')
  test(): string {
    this.logger.log('GET /map/admin/test');

    return 'Map module is working';
  }
}
