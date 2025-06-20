import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard для проверки JWT токена (переиспользуемый пакет).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}