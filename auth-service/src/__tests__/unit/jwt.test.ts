import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../utils/index.js";
import { describe, it, expect } from "@jest/globals";

describe("JWT Utils", () => {
  const payload = { userId: "123", email: "test@test.com" };

  describe("generateAccessToken", () => {
    it("should generate a valid access token", () => {
      const token = generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token and return payload with type", () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.type).toBe("access");
    });

    it("should throw on invalid token", () => {
      expect(() => verifyAccessToken("invalid-token")).toThrow();
    });

    it("should throw when using refresh token as access token", () => {
      const refreshToken = generateRefreshToken(payload);
      expect(() => verifyAccessToken(refreshToken)).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token and return payload with type", () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.type).toBe("refresh");
    });

    it("should throw when using access token as refresh token", () => {
      const accessToken = generateAccessToken(payload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
