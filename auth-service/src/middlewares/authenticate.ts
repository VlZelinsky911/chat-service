import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/index.js";
import { ApiError } from "../utils/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

const extractToken = (req: Request): string | null => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1] || null;
  }

  return null;
};

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractToken(req);

  if (!token) {
    return next(ApiError.unauthorized("Access token is required"));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired access token"));
  }
};
