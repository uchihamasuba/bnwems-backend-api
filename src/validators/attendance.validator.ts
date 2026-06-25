import { z } from 'zod';

export const checkInSchema = z.object({
  body: z.object({
    assignmentId: z.string().regex(/^\d+$/, 'Invalid ID format'),
    checkInTime: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
  }),
});

export const confirmAttendanceSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Invalid ID format'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
    checkOutTime: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
  }),
});
