import {
  Controller, Get,
} from '@nestjs/common';

@Controller('unit')
export class UnitController {
  @Get('admin/test')
  public test(): string {
    return 'Unit module is working';
  }
}
