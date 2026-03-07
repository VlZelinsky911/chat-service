import request from "supertest";
import mongoose from "mongoose";
import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  it,
  expect,
  beforeEach,
} from "@jest/globals";
import { User } from "../../modules/user/index.js";
import app from "../../app.js";

const TEST_DB_URI =
  process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/auth-service-test";

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("Auth Routes Integration", () => {
  const testUser = {
    email: "test@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user and return 201", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 409 if email already exists", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(409);
    });

    it("should return 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid", password: "password123" });

      expect(res.status).toBe(400);
    });

    it("should return 400 for short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com", password: "short" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login and return 200 with tokens", async () => {
      const res = await request(app).post("/api/auth/login").send(testUser);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrong_password" });

      expect(res.status).toBe(401);
    });

    it("should return 401 for non-existing email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "none@example.com", password: "password123" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user profile with valid token", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      const accessToken = registerRes.body.data.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(testUser.email);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });
  });
});
