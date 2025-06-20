import { Module } from '@nestjs/common';
import {
  ConfigModule, ConfigService,
} from '@nestjs/config';
import { LoggerModule } from '@libs/logger';
import { APP_FILTER } from '@nestjs/core';
import { DbModule } from './core/db';
import { UserModule } from './user/user.module';
import { GameSessionModule } from './game-session/game-session.module';
import { PlayerModule } from './player/player.module';
import { BuildingModule } from './building/building.module';
import { UnitModule } from './unit/unit.module';
import { MapModule } from './map/map.module';
import { HttpExceptionFilter } from './core/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('NODE_ENV', 'development'),
    }),
    DbModule,
    UserModule,
    GameSessionModule,
    PlayerModule,
    BuildingModule,
    UnitModule,
    MapModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
