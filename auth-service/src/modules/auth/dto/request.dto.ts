import { registerSchema, loginSchema } from "../auth.schemas.js";

export class RegisterDto {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }

  static validate(data: unknown): RegisterDto {
    const parsed = registerSchema.parse(data);
    return new RegisterDto(parsed);
  }
}

export class LoginDto {
  email: string;
  password: string;

  constructor(data: { email: string; password: string }) {
    this.email = data.email;
    this.password = data.password;
  }

  static validate(data: unknown): LoginDto {
    const parsed = loginSchema.parse(data);
    return new LoginDto(parsed);
  }
}
