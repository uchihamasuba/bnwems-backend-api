import { z } from 'zod';
import { ScheduleStatus, SurveyStatus, ReportType } from '@prisma/client';

// ============================================================================
// WORK TASKS
// ============================================================================

export const getWorkTasksSchema = z.object({
  query: z.object({
    isActive: z.enum(['true', 'false']).optional(),
  }),
});

// ============================================================================
// SCHEDULE PLANS
// ============================================================================

export const getSchedulePlansSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    orderId: z.string().regex(/^\d+$/).optional(),
    assignedTo: z.string().regex(/^\d+$/).optional(),
    status: z.nativeEnum(ScheduleStatus).optional(),
    date: z.string().optional(), // YYYY-MM-DD
  }),
});

export const createSchedulePlanSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    taskId: z.number().int().positive(),
    assignedTo: z.number().int().positive(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateSchedulePlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateSchedulePlanStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.nativeEnum(ScheduleStatus),
    notes: z.string().optional(),
    evidenceId: z.number().int().positive().optional(),
  }),
});

// ============================================================================
// SURVEY REPORTS
// ============================================================================

export const getSurveyReportsSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^\d+$/).optional(), // Can be in query or params depending on route
  }),
});

export const getSurveyReportByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
});

export const createSurveyReportSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive(),
    planId: z.number().int().positive().optional(),
    evidenceId: z.number().int().positive().optional(),
    surveyDate: z.string().datetime(),
    location: z.string().min(1),
    area: z.number().min(0).optional(),
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    entrance: z.string().optional(),
    siteConstraints: z.string().optional(),
    additionalRequests: z.string().optional(),
    proposedItems: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const confirmSurveyReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    status: z.nativeEnum(SurveyStatus),
  }),
});

// ============================================================================
// HANDOVER & COLLECTED REPORTS (MOBILE FIELD OPS)
// ============================================================================

export const handoverSchedulePlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    notes: z.string().optional(),
    evidenceId: z.number().int().positive(),
  }),
});

export const createCollectedReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/), // orderId
  }),
  body: z.object({
    reportType: z.nativeEnum(ReportType),
    notes: z.string().optional(),
    items: z
      .array(
        z.object({
          itemId: z.number().int().positive(),
          goodQuantity: z.number().int().min(0),
          damagedQuantity: z.number().int().min(0),
          lostQuantity: z.number().int().min(0),
          notes: z.string().optional(),
        }),
      )
      .min(1),
  }),
});
