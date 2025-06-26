import {
  Controller, Get, Param, Logger, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/nest-jwt';
import { MapDto } from './map.dto';
import { MapService } from '../domain/map.service';

@ApiTags('Map')
@Controller('v1/maps')
export class MapController {
  private readonly logger = new Logger(MapController.name);

  constructor(private readonly mapService: MapService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiCookieAuth()
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
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Map not found.',
  })
  public async getMapById(@Param('id') id: string): Promise<MapDto> {
    this.logger.log(`GET /v1/maps/${ id }`);
    return this.mapService.getMapById(id);
  }

  @Get(':id/ascii')
  @ApiOperation({ summary: 'Get map as ASCII art' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Map ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the map in ASCII art format.',
    type: 'string',
  })
  public async getMapAsAscii(@Param('id') id: string): Promise<string> {
    this.logger.log(`GET /v1/maps/${ id }/ascii`);

    const map = await this.mapService.getMapById(id);

    const asciiMap = map.terrainData.map(row =>
      row.map(cell => {
        switch (cell) {
        case 'Dirt': return '.';
        case 'Rock': return '#';
        case 'Bedrock': return 'X';
        case 'Empty': return ' ';
        case 'GoldCluster': return 'G';
        case 'CrystalCluster': return 'C';
        case 'IronCluster': return 'I';
        default: return '?';
        }
      }).join('')).join('\n');

    return asciiMap;
  }
}
