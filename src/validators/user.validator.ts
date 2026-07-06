import { z } from 'zod';
import { Role, UserStatus } from '@prisma/client';

export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required'),
    role: z.nativeEnum(Role),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    fullName: z.string().min(1, 'Full name is required').optional(),
    role: z.nativeEnum(Role).optional(),
    email: z.string().email('Invalid email').optional().nullable(),
    phone: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus, {
      message: 'Invalid status',
    }),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});
