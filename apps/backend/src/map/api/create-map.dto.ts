import { MapSize } from '../domain/map.entity';

export class CreateMapDto {
  size: MapSize;
  playersCount: number;
}
