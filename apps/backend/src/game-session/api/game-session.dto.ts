/**
 * DTO для игровой сессии (ответ API).
 */
export class GameSessionDto {
  /** Уникальный идентификатор сессии */
  id!: string;
  /** Идентификатор карты (может быть null) */
  mapId!: string | null;
  /** Статус игры */
  status!: string;
  /** Дата создания */
  createdAt!: string;
  /** Дата завершения */
  finishedAt?: string;
}
