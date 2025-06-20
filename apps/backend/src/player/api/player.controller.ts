import {
  Controller, Get,
} from '@nestjs/common';

/**
 * Контроллер для управления игроками.
 */
@Controller('player')
export class PlayerController {
  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'Player module is working';
  }
}
