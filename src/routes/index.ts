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
import quotationRoutes from './quotation.route';
import changeRequestRoutes from './changerequest.route';
import inventoryRoutes from './inventory.route';
import warehouseRoutes from './warehouse.route';
import taskRoutes from './task.route';
import suppliertxRoutes from './suppliertx.route';
import paymentRoutes from './payment.route';
import settlementRoutes from './settlement.route';
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
router.use('/quotations', quotationRoutes);
router.use('/change-requests', changeRequestRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/warehouse', warehouseRoutes);
router.use('/tasks', taskRoutes);
router.use('/', suppliertxRoutes);
router.use('/payments', paymentRoutes);
router.use('/settlements', settlementRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/warehouse-histories', authenticate, authorizeRoles('ADMIN', 'MANAGER'), warehouseController.getWarehouseHistories);

export default router;
