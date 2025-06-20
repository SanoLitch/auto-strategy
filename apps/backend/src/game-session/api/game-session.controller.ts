import {
  Controller, Get, Post, Param, HttpCode, HttpStatus,
} from '@nestjs/common';
import { GameSessionDto } from './game-session.dto';
import { GameSessionService } from '../domain/game-session.service';

/**
 * Контроллер для управления игровыми сессиями.
 */
@Controller('games')
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'GameSession module is working';
  }

  /**
   * Создать новую игровую сессию (асинхронно).
   * @returns GameSessionDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGameSession(): Promise<GameSessionDto> {
    const session = await this.gameSessionService.createGameSession();

    return session;
  }

  /**
   * Получить состояние игровой сессии по id.
   * @param id string
   * @returns GameSessionDto
   */
  @Get(':id')
  async getGameSession(@Param('id') id: string): Promise<GameSessionDto> {
    const session = await this.gameSessionService.getGameSessionById(id);

    return session;
  }
}
