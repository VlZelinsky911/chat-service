import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService, type AuthenticatedUser } from '../services/jwt.service.js';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: AuthenticatedUser;
  };
}

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException({
        code: 'UNAUTHORIZED',
        message: 'Access token is required',
      });
    }

    try {
      const payload = this.jwtService.verifyAccessToken(token);
      const user = this.jwtService.extractUserFromPayload(payload);

      // Attach user to socket.data
      client.data.user = user;

      return true;
    } catch {
      throw new WsException({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired access token',
      });
    }
  }

  private extractToken(client: Socket): string | null {
    // Try handshake.auth first (recommended for Socket.IO)
    const authToken = client.handshake.auth?.token;
    if (authToken) {
      return authToken;
    }

    // Fallback to query parameter
    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string') {
      return queryToken;
    }

    // Fallback to Authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split(' ')[1] || null;
    }

    return null;
  }
}
