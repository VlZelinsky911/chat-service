import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { AuthService } from "../../modules/auth/index.js";
import { comparePassword } from "../../utils/password.js";
import { verifyRefreshToken } from "../../utils/jwt.js";

jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn<any>().mockResolvedValue("hashed_password"),
  comparePassword: jest.fn<any>(),
}));

jest.mock("../../utils/jwt", () => ({
  generateAccessToken: jest.fn<any>().mockReturnValue("mock_access_token"),
  generateRefreshToken: jest.fn<any>().mockReturnValue("mock_refresh_token"),
  verifyRefreshToken: jest.fn<any>(),
}));

const mockUserService = {
  findByEmail: jest.fn<any>(),
  findByEmailWithPassword: jest.fn<any>(),
  findById: jest.fn<any>(),
  create: jest.fn<any>(),
  addRefreshToken: jest.fn<any>(),
  removeRefreshToken: jest.fn<any>(),
  removeAllRefreshTokens: jest.fn<any>(),
  hasRefreshToken: jest.fn<any>(),
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(mockUserService as any);
  });

  describe("register", () => {
    it("should register a new user and return tokens", async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue({
        _id: { toString: () => "user_id" },
        email: "test@test.com",
      });
      mockUserService.addRefreshToken.mockResolvedValue(null);

      const result = await authService.register("test@test.com", "password123");

      expect(result.accessToken).toBe("mock_access_token");
      expect(result.refreshToken).toBe("mock_refresh_token");
      expect(result.user.email).toBe("test@test.com");
      expect(mockUserService.findByEmail).toHaveBeenCalledWith("test@test.com");
      expect(mockUserService.create).toHaveBeenCalled();
      expect(mockUserService.addRefreshToken).toHaveBeenCalled();
    });

    it("should throw conflict if email already exists", async () => {
      mockUserService.findByEmail.mockResolvedValue({ email: "test@test.com" });

      await expect(
        authService.register("test@test.com", "password123"),
      ).rejects.toThrow("Email already exists");

      expect(mockUserService.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login and return tokens", async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue({
        _id: { toString: () => "user_id" },
        email: "test@test.com",
        password: "hashed_password",
      });
      (comparePassword as jest.Mock<any>).mockResolvedValue(true);
      mockUserService.addRefreshToken.mockResolvedValue(null);

      const result = await authService.login("test@test.com", "password123");

      expect(result.accessToken).toBe("mock_access_token");
      expect(result.refreshToken).toBe("mock_refresh_token");
      expect(result.user.email).toBe("test@test.com");
    });

    it("should throw unauthorized if user not found", async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login("wrong@test.com", "password123"),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw unauthorized if password is wrong", async () => {
      mockUserService.findByEmailWithPassword.mockResolvedValue({
        _id: { toString: () => "user_id" },
        email: "test@test.com",
        password: "hashed_password",
      });
      (comparePassword as jest.Mock<any>).mockResolvedValue(false);

      await expect(
        authService.login("test@test.com", "wrong_password"),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user_id",
        email: "test@test.com",
        type: "refresh",
      });
      mockUserService.findById.mockResolvedValue({ _id: "user_id" });
      mockUserService.removeRefreshToken.mockResolvedValue(null);

      const result = await authService.logout("valid_refresh_token");

      expect(result.success).toBe(true);
      expect(mockUserService.removeRefreshToken).toHaveBeenCalledWith(
        "user_id",
        "valid_refresh_token",
      );
    });
  });

  describe("refresh", () => {
    it("should revoke all tokens on token reuse", async () => {
      (verifyRefreshToken as jest.Mock).mockReturnValue({
        userId: "user_id",
        email: "test@test.com",
        type: "refresh",
      });
      mockUserService.findById.mockResolvedValue({
        _id: "user_id",
        email: "test@test.com",
      });
      mockUserService.hasRefreshToken.mockResolvedValue(false);
      mockUserService.removeAllRefreshTokens.mockResolvedValue(null);

      await expect(authService.refresh("stolen_token")).rejects.toThrow(
        "Token reuse detected",
      );

      expect(mockUserService.removeAllRefreshTokens).toHaveBeenCalledWith(
        "user_id",
      );
    });
  });
});
