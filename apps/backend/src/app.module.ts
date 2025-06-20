import { Module } from '@nestjs/common';
import {
  ConfigModule, ConfigService,
} from '@nestjs/config';
import { LoggerModule } from '@libs/logger';
import { DbModule } from './db';
import { UserModule } from './user/user.module';
import { GameSessionModule } from './game-session/game-session.module';
import { PlayerModule } from './player/player.module';
import { BuildingModule } from './building/building.module';
import { UnitModule } from './unit/unit.module';
import { MapModule } from './map/map.module';
import { AppConfig } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => configService.get('NODE_ENV', 'development'),
    }),
    DbModule,
    UserModule,
    GameSessionModule,
    PlayerModule,
    BuildingModule,
    UnitModule,
    MapModule,
  ],
})
export class AppModule { }
