import {
  Controller, Get, Post, Param, HttpCode, HttpStatus, Logger, UseGuards, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/nest-jwt';
import { Request } from 'express';
import { GameSessionDto } from './game-session.dto';
import { GameSessionService } from '../domain/game-session.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Game Session')
@Controller('v1/games')
export class GameSessionController {
  private readonly logger = new Logger(GameSessionController.name);

  constructor(private readonly gameSessionService: GameSessionService) {}

  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for GameSession module' })
  public test(): string {
    this.logger.log('GET /v1/games/admin/test');

    return 'GameSession module is working';
  }

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
  public async createGameSession(): Promise<GameSessionDto> {
    this.logger.log('POST /v1/games - create game session');

    const session = await this.gameSessionService.createGameSession();

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
    @Req() req: RequestWithUser,
  ): Promise<void> {
    const userId = req.user.sub;

    this.logger.log(`POST /v1/games/${ sessionId }/players - userId: ${ userId } requests to join`);

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
    this.logger.log(`GET /v1/games/${ id }`);

    const session = await this.gameSessionService.getGameSessionById(id);

    return session;
  }
}
