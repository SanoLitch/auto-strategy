import {
  Controller, Get,
} from '@nestjs/common';

/**
 * Контроллер для управления зданиями.
 */
@Controller('building')
export class BuildingController {
  /**
   * Smoke test endpoint для проверки работоспособности модуля.
   */
  @Get('admin/test')
  test(): string {
    return 'Building module is working';
  }
}
