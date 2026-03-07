import { User } from "./user.model.js";
import type { IUser } from "./user.types.js";

export class UserService {
  async create(data: Omit<IUser, "createdAt" | "updatedAt" | "refreshTokens">) {
    return User.create(data);
  }

  async findById(id: string) {
    return User.findById(id);
  }

  async findByEmail(email: string) {
    return User.findOne({ email });
  }

	async findByEmailWithPassword(email: string){
		return User.findOne({email}).select("+password");
	}

  async update(id: string, data: Partial<IUser>) {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return User.findByIdAndDelete(id);
  }

  async addRefreshToken(userId: string, token: string, expiresAt: Date) {
    return User.findByIdAndUpdate(
      userId,
      { $push: { refreshTokens: { token, expiresAt } } },
      { new: true },
    );
  }

  async removeRefreshToken(userId: string, token: string) {
    return User.findByIdAndUpdate(
      userId,
      { $pull: { refreshTokens: { token } } },
      { new: true },
    );
  }

  async removeAllRefreshTokens(userId: string) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { refreshTokens: [] } },
      { new: true },
    );
  }

  async hasRefreshToken(userId: string, token: string) {
    const user = await User.findOne({
      _id: userId,
      "refreshTokens.token": token,
    });
    return !!user;
  }
}
