import {
  Body, Controller, Get, Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@libs/nest-jwt';
import { CreatePlayerDto } from './create-player.dto';
import { PlayerDto } from './player.dto';
import { PlayerService } from '../domain/player.service';

/**
 * Контроллер для управления игроками.
 */
@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'Player module is working';
  }

  /**
   * Присоединить игрока к игровой сессии.
   */
  @UseGuards(JwtAuthGuard)
  @Post('join')
  async join(@Req() req: Request, @Body() dto: CreatePlayerDto): Promise<PlayerDto> {
    const userId = (req.user as any).sub;

    return this.playerService.createPlayer(
      userId,
      dto.gameSessionId,
    );
  }
}
