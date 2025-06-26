import {
  Controller, Get, Post, Param, HttpCode, HttpStatus, Logger, UseGuards, Body,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth,
} from '@nestjs/swagger';
import {
  JwtAuthGuard, UserId,
} from '@libs/nest-jwt';
import { GameSessionDto } from './game-session.dto';
import { CreateGameSessionDto } from './create-game-session.dto';
import { GameSessionService } from '../domain/game-session.service';

@ApiTags('Game Sessions')
@Controller('v1/sessions')
export class GameSessionController {
  private readonly logger = new Logger(GameSessionController.name);

  constructor(private readonly gameSessionService: GameSessionService) {}

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
  public async createGameSession(
    @Body() dto: CreateGameSessionDto,
  ): Promise<GameSessionDto> {
    this.logger.log('POST /v1/sessions - create game session');

    const session = await this.gameSessionService.createGameSession(dto.mapSize, dto.playersCount);

    return session;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/players')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Request to join a game session as a player' })
  @ApiParam({
    name: 'id',
    description: 'Game Session ID',
  })
  @ApiResponse({
    status: 202,
    description: 'The request to join has been accepted and is being processed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: 404,
    description: 'Game session not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. Session is full or not accepting new players.',
  })
  public async joinGameSession(
    @Param('id') sessionId: string,
    @UserId() userId: string,
  ): Promise<void> {
    this.logger.log(`POST /v1/sessions/${ sessionId }/players - userId: ${ userId } requests to join`);

    await this.gameSessionService.requestToJoinSession(userId, sessionId);
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
  public async getGameSession(@Param('id') id: string): Promise<GameSessionDto> {
    this.logger.log(`GET /v1/sessions/${ id }`);

    const session = await this.gameSessionService.getGameSessionById(id);

    return session;
  }
}
