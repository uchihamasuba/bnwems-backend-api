import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the schema for our environment variables using Zod
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('8h'),

  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default(12),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default(5),
  LOCK_DURATION_MINUTES: z.string().transform(Number).default(15),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required').optional(),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_CLIENT_EMAIL is required').optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required').optional(),
  FIREBASE_STORAGE_BUCKET: z.string().min(1, 'FIREBASE_STORAGE_BUCKET is required').optional(),
});

// Validate the environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
