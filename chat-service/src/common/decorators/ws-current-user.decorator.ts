import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedSocket } from '../guards/ws-auth.guard.js';
import type { AuthenticatedUser } from '../services/jwt.service.js';

export const WsCurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
    const user = client.data?.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
