import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import notificationRoutes from './notification.route';
import catalogRoutes from './catalog.route';
import supplierRoutes from './supplier.route';
import policyRoutes from './policy.route';
import attendanceRoutes from './attendance.route';
import wageRoutes from './wage.route';
import customerRoutes from './customer.route';
import orderRoutes from './order.route';
import { quotationRouter } from './quotation.route';
import { changeRequestRouter } from './changerequest.route';
import inventoryRoutes from './inventory.route';
import warehouseRoutes from './warehouse.route';
import { taskRouter } from './task.route';
import suppliertxRoutes from './suppliertx.route';
import { paymentRouter } from './payment.route';
import { settlementRouter } from './settlement.route';
import reportRoutes from './report.route';
import dashboardRoutes from './dashboard.route';

// Import controllers directly for simple routes
import * as warehouseController from '../controllers/warehouse.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/catalog-items', catalogRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/policies', policyRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/wages', wageRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/quotations', quotationRouter);
router.use('/change-requests', changeRequestRouter);
router.use('/inventory', inventoryRoutes);
router.use('/warehouse', warehouseRoutes);
router.use('/tasks', taskRouter);
router.use('/', suppliertxRoutes);
router.use('/payments', paymentRouter);
router.use('/settlements', settlementRouter);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/warehouse-histories', authenticate, authorizeRoles('ADMIN', 'MANAGER'), warehouseController.getWarehouseHistories);

export default router;
