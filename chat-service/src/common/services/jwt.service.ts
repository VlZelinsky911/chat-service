import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = this.configService.getOrThrow<string>(
      'jwt.accessTokenSecret',
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.accessTokenSecret) as JwtPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  }

  extractUserFromPayload(payload: JwtPayload): AuthenticatedUser {
    return {
      userId: payload.userId,
      email: payload.email,
    };
  }

  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1] || null;
  }

  extractTokenFromCookie(cookies: Record<string, string>): string | null {
    return cookies?.accessToken || null;
  }
}
