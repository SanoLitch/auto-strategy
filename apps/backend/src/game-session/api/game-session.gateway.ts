import {
  WebSocketGateway, WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { GameSessionDto } from './game-session.dto';

/**
 * WebSocket Gateway для игровой сессии.
 */
@WebSocketGateway({
  namespace: 'games',
  cors: true,
})
export class GameSessionGateway {
  @WebSocketServer()
  public server!: Server;

  /**
   * Отправить обновление состояния игровой сессии всем клиентам в комнате (gameId).
   * @param gameId string
   * @param state GameSessionDto
   */
  public emitGameStateUpdate(gameId: string, state: GameSessionDto): void {
    this.server.to(gameId).emit('game_state_update', state);
  }
}
