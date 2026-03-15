import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService, type AuthenticatedUser } from '../services/jwt.service.js';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class HttpAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = this.jwtService.verifyAccessToken(token);
      const user = this.jwtService.extractUserFromPayload(payload);

      // Attach user to request
      (request as AuthenticatedRequest).user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractToken(request: Request): string | null {
    // Try Authorization header first
    const authHeader = request.headers.authorization;
    const headerToken = this.jwtService.extractTokenFromHeader(authHeader);
    if (headerToken) {
      return headerToken;
    }

    // Fallback to cookie
    const cookieToken = this.jwtService.extractTokenFromCookie(
      request.cookies as Record<string, string>,
    );
    if (cookieToken) {
      return cookieToken;
    }

    return null;
  }
}
