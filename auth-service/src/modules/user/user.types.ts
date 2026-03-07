import { Model } from "mongoose";

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface IUser {
  email: string;
  password: string;
  refreshTokens: IRefreshToken[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}
export type IUserModel = Model<IUser, {}, IUserMethods>;
