import {
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameSessionDto } from './game-session.dto';

@WebSocketGateway({
  namespace: 'games',
  cors: true,
})
export class GameSessionGateway {
  @WebSocketServer()
  server: Server;

  public emitGameStateUpdate(gameId: string, state: GameSessionDto): void {
    this.server.to(gameId).emit('game_state_update', state);
  }
}
