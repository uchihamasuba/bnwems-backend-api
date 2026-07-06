import { z } from 'zod';
import { PolicyType } from '@prisma/client';

export const getPoliciesSchema = z.object({
  query: z.object({
    policyType: z.nativeEnum(PolicyType).optional(),
    isActive: z.string().optional(),
  }),
});

export const createPolicySchema = z.object({
  body: z.object({
    policyCode: z.string().min(1),
    policyName: z.string().min(1),
    policyType: z.nativeEnum(PolicyType),
    policyValue: z.number().min(0),
    unit: z.string().min(1),
    description: z.string().optional(),
  }),
});

export const updatePolicySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    policyValue: z.number().min(0).optional(),
    unit: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    description: z.string().optional(),
  }),
});
