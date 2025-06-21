import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from './types';


export const UserId = createParamDecorator(
  (_, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    if (!request.user?.sub) {
      throw new Error('User ID not found in request. Make sure JwtAuthGuard is applied.');
    }
    return request.user.sub;
  },
);