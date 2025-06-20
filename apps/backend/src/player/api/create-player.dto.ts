import { IsUUID } from 'class-validator';

export class CreatePlayerDto {
  @IsUUID()
  gameSessionId: string;
}
