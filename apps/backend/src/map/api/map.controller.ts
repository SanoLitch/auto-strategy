import {
  Controller, Get, Param, Logger,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { MapDto } from './map.dto';
import { MapService } from '../domain/map.service';

@ApiTags('Map')
@Controller('v1/maps')
export class MapController {
  private readonly logger = new Logger(MapController.name);

  constructor(private readonly mapService: MapService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a map by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Map ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the map details.',
    type: MapDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Map not found.',
  })
  async getMapById(@Param('id') id: string): Promise<MapDto> {
    this.logger.log(`GET /v1/maps/${ id }`);
    return this.mapService.getMapById(id);
  }

  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for Map module' })
  test(): string {
    this.logger.log('GET /v1/maps/admin/test');
    return 'Map module is working';
  }
}
