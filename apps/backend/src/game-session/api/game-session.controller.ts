import {
  Controller, Get, Post, Param, HttpCode, HttpStatus, Logger,
} from '@nestjs/common';
import { GameSessionDto } from './game-session.dto';
import { GameSessionService } from '../domain/game-session.service';

@Controller('games')
export class GameSessionController {
  private readonly logger = new Logger(GameSessionController.name);

  constructor(private readonly gameSessionService: GameSessionService) {}

  @Get('admin/test')
  test(): string {
    this.logger.log('GET /games/admin/test');
    return 'GameSession module is working';
  }

  /**
   * Создать новую игровую сессию (асинхронно).
   * @returns GameSessionDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGameSession(): Promise<GameSessionDto> {
    this.logger.log('POST /games - create game session');

    const session = await this.gameSessionService.createGameSession();

    return session;
  }

  @Get(':id')
  async getGameSession(@Param('id') id: string): Promise<GameSessionDto> {
    this.logger.log(`GET /games/${ id }`);

    const session = await this.gameSessionService.getGameSessionById(id);

    return session;
  }
}
