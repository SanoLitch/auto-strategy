import { Controller } from '@nestjs/common';
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
}
