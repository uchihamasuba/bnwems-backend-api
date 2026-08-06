import { z } from 'zod';

export const getCustomersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
  }),
});

export const getCustomerByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
});

export const createCustomerSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(10, 'Phone is required and must be valid'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    customerName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
});
