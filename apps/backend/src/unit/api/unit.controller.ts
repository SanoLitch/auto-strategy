import {
  Controller, Get,
} from '@nestjs/common';

/**
 * Контроллер для управления юнитами.
 */
@Controller('unit')
export class UnitController {
  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'Unit module is working';
  }
}
