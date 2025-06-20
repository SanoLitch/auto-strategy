import {
  Body, Controller, Get, Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@libs/nest-jwt';
import { Logger } from '@nestjs/common';
import { CreatePlayerDto } from './create-player.dto';
import { PlayerDto } from './player.dto';
import { PlayerService } from '../domain/player.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Player')
@Controller('v1/players')
export class PlayerController {
  private readonly logger = new Logger(PlayerController.name);

  constructor(private readonly playerService: PlayerService) {}

  @Get('admin/test')
  @ApiOperation({ summary: 'Test endpoint for Player module' })
  test(): string {
    this.logger.log('GET /v1/players/admin/test');

    return 'Player module is working';
  }

  @UseGuards(JwtAuthGuard)
  @Post('join')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Create a new player and join a game session' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({
    status: 201,
    description: 'Player successfully created and joined the session.',
    type: PlayerDto,
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
    description: 'User has already joined this game session.',
  })
  async join(@Req() req: RequestWithUser, @Body() dto: CreatePlayerDto): Promise<PlayerDto> {
    const userId = req.user.sub;

    this.logger.log(`POST /v1/players/join - userId: ${ userId }, gameSessionId: ${ dto.gameSessionId }`);

    return this.playerService.createPlayer(
      userId,
      dto.gameSessionId,
    );
  }
}
