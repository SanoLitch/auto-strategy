import { MapSize } from '../domain/map.entity';

/**
 * DTO для создания карты (запрос API).
 */
export class CreateMapDto {
  /** Размеры карты */
  size: MapSize;
  /** Количество игроков */
  playersCount: number;
}
