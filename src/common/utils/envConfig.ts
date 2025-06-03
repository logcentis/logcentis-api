import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  HOST: z.string().min(1).default('localhost'),
  PORT: z.coerce.number().int().positive().default(8080),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .default(1000),

  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  DB_URL_DEV: z.string().url().optional().superRefine((val, ctx) => {
    if (process.env.NODE_ENV === 'development' && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DB_URL_DEV is required in development mode',
        path: ['DB_URL_DEV'],
      });
    }
  }),
  DB_URL_PROD: z.string().url().optional().superRefine((val, ctx) => {
    if (process.env.NODE_ENV === 'production' && !val) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DB_URL_PROD is required in production mode',
        path: ['DB_URL_PROD'],
      });
    }
  }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Invalid environment variables');
}

export const env = {
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === 'development',
  isProduction: parsedEnv.data.NODE_ENV === 'production',
  // isTest: parsedEnv.data.NODE_ENV === 'test',
};
