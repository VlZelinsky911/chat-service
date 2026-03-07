import bcrypt from "bcrypt";
import { env } from "../config/env.js";

export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, env.BCRYPT_COST);
}

export const comparePassword = async(password: string, hashedPassword: string): Promise<boolean> => {
	return bcrypt.compare(password, hashedPassword);
}