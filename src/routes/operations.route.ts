import { Router } from 'express';
import { operationsController } from '../controllers/operations.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getWorkTasksSchema,
  getSchedulePlansSchema,
  createSchedulePlanSchema,
  updateSchedulePlanSchema,
  updateSchedulePlanStatusSchema,
  getSurveyReportsSchema,
  getSurveyReportByIdSchema,
  createSurveyReportSchema,
  confirmSurveyReportSchema,
  handoverSchedulePlanSchema,
  createCollectedReportSchema,
} from '../validators/operations.validator';

const router = Router();

// ============================================================================
// WORK TASKS
// ============================================================================

router.get('/work-tasks', protect, validate(getWorkTasksSchema), operationsController.getWorkTasks);

// ============================================================================
// SCHEDULE PLANS
// ============================================================================

router.get(
  '/schedule-plans',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER),
  validate(getSchedulePlansSchema),
  operationsController.getSchedulePlans,
);

router.post(
  '/schedule-plans',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER),
  validate(createSchedulePlanSchema),
  operationsController.createSchedulePlan,
);

router.put(
  '/schedule-plans/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER),
  validate(updateSchedulePlanSchema),
  operationsController.updateSchedulePlan,
);

router.patch(
  '/schedule-plans/:id/status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER),
  validate(updateSchedulePlanStatusSchema),
  operationsController.updateSchedulePlanStatus,
);

// ============================================================================
// SURVEY REPORTS
// ============================================================================

router.get(
  '/orders/:orderId/survey-reports',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER, Role.TECHNICAL),
  validate(getSurveyReportsSchema),
  operationsController.getOrderSurveyReports,
);

router.get(
  '/survey-reports/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER, Role.TECHNICAL),
  validate(getSurveyReportByIdSchema),
  operationsController.getSurveyReportById,
);

router.post(
  '/survey-reports',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER, Role.LEADER, Role.TECHNICAL),
  validate(createSurveyReportSchema),
  operationsController.createSurveyReport,
);

router.put(
  '/survey-reports/:id/confirm',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(confirmSurveyReportSchema),
  operationsController.confirmSurveyReport,
);

// ============================================================================
// MOBILE FIELD OPS
// ============================================================================

router.get(
  '/mobile/schedule-plans',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  operationsController.getMobileSchedulePlans,
);

router.put(
  '/mobile/schedule-plans/:id/status',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  validate(updateSchedulePlanStatusSchema), // Same schema is fine
  operationsController.updateMobileSchedulePlanStatus,
);

router.get(
  '/mobile/orders/:id',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  operationsController.getMobileOrderDetails,
);

router.post(
  '/mobile/schedule-plans/:id/handover',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  validate(handoverSchedulePlanSchema),
  operationsController.handoverSchedulePlan,
);

router.post(
  '/mobile/orders/:id/collected-reports',
  protect,
  restrictTo(Role.TECHNICAL, Role.LEADER),
  validate(createCollectedReportSchema),
  operationsController.createCollectedEquipmentReport,
);

export default router;
