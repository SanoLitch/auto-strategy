import {
  Body, Controller, Get, Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@libs/nest-jwt';
import { Logger } from '@nestjs/common';
import { CreatePlayerDto } from './create-player.dto';
import { PlayerDto } from './player.dto';
import { PlayerService } from '../domain/player.service';

@Controller('player')
export class PlayerController {
  private readonly logger = new Logger(PlayerController.name);

  constructor(private readonly playerService: PlayerService) {}

  @Get('admin/test')
  test(): string {
    this.logger.log('GET /player/admin/test');

    return 'Player module is working';
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  async join(@Req() req: Request, @Body() dto: CreatePlayerDto): Promise<PlayerDto> {
    const userId = (req.user as any).sub;

    this.logger.log(`POST /player/join - userId: ${ userId }, gameSessionId: ${ dto.gameSessionId }`);

    return this.playerService.createPlayer(
      userId,
      dto.gameSessionId,
    );
  }
}
