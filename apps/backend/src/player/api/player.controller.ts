import {
  Controller, Get,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation,
} from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { PlayerService } from '../domain/player.service';

@ApiTags('Player')
@Controller('v1/players')
export class PlayerController {
  private readonly logger = new Logger(PlayerController.name);

  constructor(private readonly playerService: PlayerService) {}

  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for Player module' })
  public test(): string {
    this.logger.log('GET /v1/players/admin/test');

    return 'Player module is working';
  }
}
