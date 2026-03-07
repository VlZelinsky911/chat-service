import type { Request, Response, NextFunction } from "express";
import { UserService } from "../user/index.js";
import { AuthService } from "./auth.service.js";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
} from "../../utils/cookie.js";
import { ApiError } from "../../utils/index.js";
import {
  UserDto,
  AuthResponseDto,
  MeResponseDto,
  MessageResponseDto,
} from "./dto/index.js";

const userService = new UserService();
const authService = new AuthService(userService);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const result = await authService.register(email, password);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    const userDto = new UserDto(result.user);
    const response = new AuthResponseDto(result.accessToken, userDto);

    res.status(201).json(response.toJSON());
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    const userDto = new UserDto(result.user);
    const response = new AuthResponseDto(result.accessToken, userDto);

    res.status(200).json(response.toJSON());
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is missing");
    }

    const result = await authService.refresh(refreshToken);

    setAccessTokenCookie(res, result.accessToken);
    setRefreshTokenCookie(res, result.refreshToken);

    const userDto = new UserDto(result.user);
    const response = new AuthResponseDto(result.accessToken, userDto);

    res.status(200).json(response.toJSON());
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw ApiError.badRequest("Refresh token is missing");
    }

    await authService.logout(refreshToken);

    clearAuthCookies(res);

    const response = new MessageResponseDto("Logged out successfully");
    res.status(200).json(response.toJSON());
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw ApiError.unauthorized("User not authenticated");
    }

    await authService.logoutAll(userId);

    clearAuthCookies(res);

    const response = new MessageResponseDto("Logged out from all sessions");
    res.status(200).json(response.toJSON());
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const user = await userService.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    const userDto = UserDto.fromEntity(user);
    const response = new MeResponseDto(userDto);

    res.status(200).json(response.toJSON());
  } catch (error) {
    next(error);
  }
};
