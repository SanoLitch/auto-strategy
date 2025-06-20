import {
  Controller, Get, Param, NotFoundException,
} from '@nestjs/common';
import { MapDto } from './map.dto';
import { MapService } from '../domain/map.service';

/**
 * Контроллер для управления картами.
 */
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Получить карту по идентификатору.
   * @param id UUID карты
   */
  @Get(':id')
  async getMapById(@Param('id') id: string): Promise<MapDto> {
    return await this.mapService.getMapById(id);
  }

  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'Map module is working';
  }
}
