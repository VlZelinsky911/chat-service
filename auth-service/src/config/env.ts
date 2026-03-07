import dotenv from "dotenv";
dotenv.config();

interface Env {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES: "15m" | "30m" | "1h";
  REFRESH_TOKEN_EXPIRES: "1d" | "7d" | "30d";
  BCRYPT_COST: number;
}

export const env: Env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000"),
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/auth-service",
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || "access-secret-key-change-in-production",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ||
    "refresh-secret-key-change-in-production",
  ACCESS_TOKEN_EXPIRES:
    (process.env.ACCESS_TOKEN_EXPIRES as Env["ACCESS_TOKEN_EXPIRES"]) || "15m",
  REFRESH_TOKEN_EXPIRES:
    (process.env.REFRESH_TOKEN_EXPIRES as Env["REFRESH_TOKEN_EXPIRES"]) || "7d",
  BCRYPT_COST: parseInt(process.env.BCRYPT_COST || "12"),
};
