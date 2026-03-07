import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5001),
  CORS_ORIGIN: z.string().min(1).default('*'),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  ACCESS_TOKEN_SECRET: z.string().min(1),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;
