import {
  IsUUID, IsObject, IsOptional, IsBoolean,
} from 'class-validator';

/**
 * DTO для возврата состояния игрока.
 */
export class PlayerDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  userId!: string;

  @IsUUID()
  gameSessionId!: string;

  @IsObject()
  resources!: Record<string, number>;

  @IsOptional()
  @IsBoolean()
  isWinner?: boolean;
}
