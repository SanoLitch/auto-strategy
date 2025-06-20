import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db';
import { UserModule } from './user/user.module';
import { GameSessionModule } from './game-session/game-session.module';
import { PlayerModule } from './player/player.module';
import { BuildingModule } from './building/building.module';
import { UnitModule } from './unit/unit.module';
import { MapModule } from './map/map.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    UserModule,
    GameSessionModule,
    PlayerModule,
    BuildingModule,
    UnitModule,
    MapModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
