import {
  ApiError,
  generateAccessToken,
  generateRefreshToken,
  comparePassword,
  verifyRefreshToken,
} from "../../utils/index.js";
import { env } from "../../config/env.js";
import { UserService } from "../user/index.js";
import type { AuthResult, LogoutResult } from "./auth.types.js";
import type { TokenPayload } from "../../utils/jwt.js";

export class AuthService {
  constructor(private userService: UserService) {}

  private verifyRefresh(token: string): TokenPayload {
    try {
      return verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }
  }

  private async generateTokensAndSave(
    userId: string,
    email: string,
  ): Promise<AuthResult> {
    const payload = { userId, email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(env.REFRESH_TOKEN_EXPIRES),
    );

    await this.userService.addRefreshToken(userId, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email },
    };
  }

  async register(email: string, password: string): Promise<AuthResult> {
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw ApiError.conflict("Email already exists");
    }

    const user = await this.userService.create({
      email,
      password,
    });

    return this.generateTokensAndSave(user._id.toString(), user.email);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    return this.generateTokensAndSave(user._id.toString(), user.email);
  }

  async refresh(oldRefreshToken: string): Promise<AuthResult> {
    const payload = this.verifyRefresh(oldRefreshToken);

    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    const tokenExists = await this.userService.hasRefreshToken(
      payload.userId,
      oldRefreshToken,
    );

    if (!tokenExists) {
      await this.userService.removeAllRefreshTokens(payload.userId);
      throw ApiError.unauthorized(
        "Token reuse detected. All sessions revoked.",
      );
    }

    await this.userService.removeRefreshToken(payload.userId, oldRefreshToken);

    return this.generateTokensAndSave(payload.userId, user.email);
  }

  async logout(refreshToken: string): Promise<LogoutResult> {
    const payload = this.verifyRefresh(refreshToken);

    const user = await this.userService.findById(payload.userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    await this.userService.removeRefreshToken(payload.userId, refreshToken);

    return { success: true };
  }

  async logoutAll(userId: string): Promise<LogoutResult> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    await this.userService.removeAllRefreshTokens(userId);

    return { success: true };
  }
}
