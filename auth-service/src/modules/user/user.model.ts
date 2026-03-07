import mongoose, { Schema } from "mongoose";
import type {
  IUser,
  IUserMethods,
  IUserModel,
  IRefreshToken,
} from "./user.types.js";
import { hashPassword, comparePassword } from "../../utils/password.js";

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    refreshTokens: [refreshTokenSchema],
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return comparePassword(candidatePassword, this.password);
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
