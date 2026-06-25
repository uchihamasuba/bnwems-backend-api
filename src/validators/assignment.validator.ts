import { z } from 'zod';

export const assignStaffSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    assignments: z.array(z.object({
      userId: z.string().regex(/^\d+$/, 'Invalid ID format'),
      assignedRole: z.string().min(1, 'Assigned role is required'),
    })).min(1, 'Staff assignment information is missing.'),
  }),
});
