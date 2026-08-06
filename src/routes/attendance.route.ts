import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { z } from 'zod';

const router = Router();

const checkInSchema = z.object({
  body: z.object({
    planId: z.number().int().positive(),
    checkInEvidenceId: z.number().int().positive().optional(),
    checkInAt: z.string().datetime(),
  }),
});

const checkOutSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/),
  }),
  body: z.object({
    checkOutAt: z.string().datetime(),
    note: z.string().optional(),
  }),
});

router.post(
  '/check-in',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  validate(checkInSchema),
  attendanceController.checkIn,
);
router.put(
  '/:id/check-out',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  validate(checkOutSchema),
  attendanceController.checkOut,
);

export default router;
