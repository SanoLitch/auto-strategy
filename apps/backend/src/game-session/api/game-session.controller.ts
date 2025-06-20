import {
  Controller, Get, Post, Param, HttpCode, HttpStatus, Logger, UseGuards,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/nest-jwt';
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
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new game session' })
  @ApiResponse({
    status: 201,
    description: 'Game session created. Returns GameSessionDto with status GENERATING_MAP '
      + '(map is generated asynchronously).',
    type: GameSessionDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  async createGameSession(): Promise<GameSessionDto> {
    this.logger.log('POST /v1/games - create game session');

    const session = await this.gameSessionService.createGameSession();

    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiCookieAuth()
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
    status: 401,
    description: 'Unauthorized.',
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
