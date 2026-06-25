import { z } from 'zod';

export const getUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    role: z.string().optional(), // Could be restricted to enum if needed
    status: z.string().optional(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required'),
    roleId: z.string().regex(/^\d+$/, 'Invalid role ID format'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    role: z.enum(['ADMIN', 'MANAGER', 'STAFF'], {
      message: 'Invalid role',
    }),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED'], {
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
