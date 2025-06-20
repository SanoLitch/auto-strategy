import { IsUUID } from 'class-validator';

/**
 * DTO для присоединения к игровой сессии.
 */
export class CreatePlayerDto {
  @IsUUID()
  gameSessionId!: string;
}
