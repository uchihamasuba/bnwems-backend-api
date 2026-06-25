import { z } from 'zod';

export const getPoliciesSchema = z.object({
  query: z.object({
    policyType: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

export const createPolicySchema = z.object({
  body: z.object({
    policyType: z.string().min(1, 'Policy type is required'),
    name: z.string().min(1, 'Name is required'),
    rules: z.any(),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    rules: z.any(),
  }),
});
