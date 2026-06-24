import { z } from 'zod';

export const getSuppliersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
    search: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const createSupplierSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Supplier name is required'),
    contactPerson: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
});
