import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import * as handoverController from '../controllers/handover.controller';
import * as damagelossController from '../controllers/damageloss.controller';
import { nestedQuotationRouter } from './quotation.route';
import { nestedChangeRequestRouter } from './changerequest.route';
import { nestedTaskRouter } from './task.route';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Orders
import { validate } from '../middlewares/validate.middleware';
import { getOrdersSchema, getOrderByIdSchema, createOrderSchema, updateOrderSchema, cancelOrderSchema, getOrderStatusHistorySchema, confirmOrderSchema, changeEventDateSchema, closeOrderSchema, getOrderEvidencesSchema, getMobileSummarySchema, getWorkflowTimelineSchema } from '../validators/order.validator';

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), validate(getOrdersSchema), orderController.getOrders);
router.get('/field-progress', authorizeRoles('ADMIN', 'MANAGER'), orderController.getFieldProgress);
router.get('/:id/evidences', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF', 'TECHNICAL_STAFF'), validate(getOrderEvidencesSchema), orderController.getOrderEvidences);
router.get('/:id/mobile-summary', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF', 'TECHNICAL_STAFF'), validate(getMobileSummarySchema), orderController.getMobileSummary);
router.get('/:id/workflow-timeline', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF', 'TECHNICAL_STAFF'), validate(getWorkflowTimelineSchema), orderController.getWorkflowTimeline);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), validate(getOrderByIdSchema), orderController.getOrderById);
router.get('/:orderId/status-history', authorizeRoles('ADMIN', 'MANAGER'), validate(getOrderStatusHistorySchema), orderController.getOrderStatusHistory);

import * as assignmentController from '../controllers/assignment.controller';
router.get('/:orderId/assignments', authorizeRoles('ADMIN', 'MANAGER'), assignmentController.getAssignments);

router.post('/', authorizeRoles('ADMIN', 'MANAGER'), validate(createOrderSchema), orderController.createOrder);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), validate(updateOrderSchema), orderController.updateOrder);
router.put('/:id/cancel', authorizeRoles('ADMIN', 'MANAGER'), validate(cancelOrderSchema), orderController.cancelOrder);
router.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER'), validate(confirmOrderSchema), orderController.confirmOrder);
router.put('/:id/change-date', authorizeRoles('ADMIN', 'MANAGER'), validate(changeEventDateSchema), orderController.changeEventDate);
router.put('/:id/close', authorizeRoles('ADMIN', 'MANAGER'), validate(closeOrderSchema), orderController.closeOrder);

import { recordHandoverSchema } from '../validators/handover.validator';

import { recordDamageLossSchema } from '../validators/damageloss.validator';

router.post('/:orderId/handover', authorizeRoles('LEADER_STAFF', 'MANAGER'), validate(recordHandoverSchema), handoverController.recordHandover);
router.post('/:orderId/damage-loss', authorizeRoles('LEADER_STAFF', 'MANAGER'), validate(recordDamageLossSchema), damagelossController.recordDamageLoss);
router.get('/:orderId/damage-loss', authorizeRoles('ADMIN', 'MANAGER'), damagelossController.getDamageLossesByOrder);

import { nestedPaymentRouter } from './payment.route';
import { nestedSettlementRouter } from './settlement.route';

// Nested routes
router.use('/:orderId/quotations', nestedQuotationRouter);
router.use('/:orderId/change-requests', nestedChangeRequestRouter);
router.use('/:orderId/tasks', nestedTaskRouter);
router.use('/:orderId/payments', nestedPaymentRouter);
router.use('/:orderId/settlement', nestedSettlementRouter);

export default router;
