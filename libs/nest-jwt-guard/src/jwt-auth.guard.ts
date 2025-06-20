import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * Guard для проверки JWT токена (переиспользуемый пакет).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }