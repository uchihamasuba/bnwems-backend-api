import { z } from 'zod';

export const assignStaffSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    assignments: z.array(z.object({
      userId: z.string().uuid('Invalid user ID'),
      assignedRole: z.string().min(1, 'Assigned role is required'),
    })).min(1, 'Staff assignment information is missing.'),
  }),
});
