import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import * as handoverController from '../controllers/handover.controller';
import * as damagelossController from '../controllers/damageloss.controller';
import quotationRoutes from './quotation.route';
import changerequestRoutes from './changerequest.route';
import taskRoutes from './task.route';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Orders
router.get('/', authorizeRoles('ADMIN', 'MANAGER'), orderController.getOrders);
router.get('/field-progress', authorizeRoles('ADMIN', 'MANAGER'), orderController.getFieldProgress);
router.get('/:id', authorizeRoles('ADMIN', 'MANAGER'), orderController.getOrderById);
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), orderController.createOrder);
router.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER'), orderController.confirmOrder);
router.put('/:id/change-date', authorizeRoles('ADMIN', 'MANAGER'), orderController.changeEventDate);
router.put('/:id/close', authorizeRoles('ADMIN', 'MANAGER'), orderController.closeOrder);

router.post('/:orderId/handover', authorizeRoles('LEADER_STAFF', 'MANAGER'), handoverController.recordHandover);
router.post('/:orderId/damage-loss', authorizeRoles('LEADER_STAFF', 'MANAGER'), damagelossController.recordDamageLoss);

import paymentRoutes from './payment.route';
import settlementRoutes from './settlement.route';

// Nested routes
router.use('/:orderId/quotations', quotationRoutes);
router.use('/:orderId/change-requests', changerequestRoutes);
router.use('/:orderId/tasks', taskRoutes);
router.use('/:orderId/payments', paymentRoutes);
router.use('/:orderId/settlement', settlementRoutes);

export default router;
