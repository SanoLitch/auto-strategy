import {
  Controller, Get,
} from '@nestjs/common';

/**
 * Контроллер для управления картами.
 */
@Controller('map')
export class MapController {
  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'Map module is working';
  }
}
