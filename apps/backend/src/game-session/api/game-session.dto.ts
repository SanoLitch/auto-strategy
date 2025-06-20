export class GameSessionDto {
  id: string;
  mapId: string | null;
  status: string;
  createdAt: string;
  finishedAt?: string;
}
