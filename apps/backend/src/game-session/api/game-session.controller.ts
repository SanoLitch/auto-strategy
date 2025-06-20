import {
  Controller, Get,
} from '@nestjs/common';

/**
 * Контроллер для управления игровыми сессиями.
 */
@Controller('game-session')
export class GameSessionController {
  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'GameSession module is working';
  }
}
