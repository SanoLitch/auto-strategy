import {
  Controller, Get, Post, Param, HttpCode, HttpStatus, Logger,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { GameSessionDto } from './game-session.dto';
import { GameSessionService } from '../domain/game-session.service';

@ApiTags('Game Session')
@Controller('v1/games')
export class GameSessionController {
  private readonly logger = new Logger(GameSessionController.name);

  constructor(private readonly gameSessionService: GameSessionService) {}

  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for GameSession module' })
  test(): string {
    this.logger.log('GET /v1/games/admin/test');

    return 'GameSession module is working';
  }

  /**
   * Создать новую игровую сессию (асинхронно).
   * @returns GameSessionDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new game session' })
  @ApiResponse({
    status: 201,
    description: 'The game session has been successfully created.',
    type: GameSessionDto,
  })
  async createGameSession(): Promise<GameSessionDto> {
    this.logger.log('POST /v1/games - create game session');

    const session = await this.gameSessionService.createGameSession();

    return session;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a game session by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Game Session ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the game session details.',
    type: GameSessionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Game session not found.',
  })
  async getGameSession(@Param('id') id: string): Promise<GameSessionDto> {
    this.logger.log(`GET /v1/games/${ id }`);

    const session = await this.gameSessionService.getGameSessionById(id);

    return session;
  }
}
