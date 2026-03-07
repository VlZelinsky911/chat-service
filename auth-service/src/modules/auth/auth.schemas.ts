import { z } from "zod";

export const registerSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email format" }),
  password: z.string({ error: "Password is required" }),
});

export const refreshSchema = z.object({
  refreshToken: z.string({ error: "Refresh token is required" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
