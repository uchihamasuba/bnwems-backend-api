import { z } from 'zod';

export const getTasksSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    orderId: z.string().uuid().optional(),
    taskType: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const getAssignedTasksSchema = z.object({
  query: z.object({
    date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
    status: z.string().optional(),
  }),
});

export const createTaskSchema = z.object({
  params: z.object({
    orderId: z.string().uuid().optional(),
  }),
  body: z.object({
    orderId: z.string().uuid('Invalid order ID').optional(),
    taskType: z.string().min(1, 'Task type is required'),
    scheduledStart: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    scheduledEnd: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
    location: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    scheduledStart: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
    scheduledEnd: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'Invalid date format' }).optional(),
    location: z.string().optional(),
  }),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

export const updateTaskProgressSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    status: z.string().min(1, 'Status is required'),
    notes: z.string().optional(),
  }),
});

export const recordSurveyReportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
  body: z.object({
    notes: z.string().optional(),
    evidences: z.array(z.object({
      fileUrl: z.string().url('Invalid URL format'),
    })).min(1, 'Must include at least one photo evidence'),
  }),
});

export const viewSurveyReportSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});

export const viewPickListSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid task ID'),
  }),
});
