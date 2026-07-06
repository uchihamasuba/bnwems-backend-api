import { Router } from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import wageRoutes from './wage.route';
import customerRoutes from './customer.route';
import orderRoutes from './order.route';
import catalogRoutes from './catalog.route';
import inventoryRoutes from './inventory.route';
import policyRoutes from './policy.route';
import quotationRoutes from './quotation.route';
import supplierRoutes from './supplier.route';
import operationsRoutes from './operations.route';
import attendanceRoutes from './attendance.route';
import dashboardRoutes from './dashboard.route';
import evidenceRoutes from './evidence.route';
import reportsRoutes from './reports.route';
import managerRoutes from './manager.route';

import notificationRoutes from './notification.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/wages', wageRoutes);
router.use('/customers', customerRoutes);

// Batch 1
router.use('/catalog', catalogRoutes);
router.use('/inventory', inventoryRoutes);

import supplierTransactionRoutes from './supplier-transaction.route';

// Batch 2
router.use('/policies', policyRoutes);
router.use('/quotations', quotationRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/supplier-transactions', supplierTransactionRoutes);

import warningRoutes from './warning.route';
import depositRoutes from './deposit.route';
import settlementRoutes from './settlement.route';

// Batch 3
router.use('/orders', orderRoutes);
router.use('/warnings', warningRoutes);
router.use('/deposits', depositRoutes);
router.use('/settlements', settlementRoutes);

// Batch 4
router.use('/', operationsRoutes); // operationsRoutes handles /work-tasks, /schedule-plans, /survey-reports, /mobile
router.use('/attendance', attendanceRoutes);

// Batch 5
router.use('/dashboard', dashboardRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/reports', reportsRoutes);
router.use('/manager', managerRoutes);

export default router;
