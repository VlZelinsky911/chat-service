import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface TokenPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
}

export const generateAccessToken = (
  payload: Omit<TokenPayload, "type">,
): string => {
  return jwt.sign({ ...payload, type: "access" }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = (
  payload: Omit<TokenPayload, "type">,
): string => {
  return jwt.sign({ ...payload, type: "refresh" }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  
	const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
  
	if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }
  return decoded;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  
	const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
  
	if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }
  return decoded;
};
