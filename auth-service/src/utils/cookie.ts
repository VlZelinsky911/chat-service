import type { Response, CookieOptions } from "express";
import { env } from "../config/env.js";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export const setAccessTokenCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};
