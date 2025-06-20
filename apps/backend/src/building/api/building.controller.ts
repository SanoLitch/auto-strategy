import {
  Controller, Get,
} from '@nestjs/common';

@Controller('building')
export class BuildingController {
  @Get('admin/test')
  test(): string {
    return 'Building module is working';
  }
}
