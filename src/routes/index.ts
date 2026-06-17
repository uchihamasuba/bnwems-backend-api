import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import equipmentRoutes from './equipment.routes';
import policyRoutes from './policy.routes';
import customerRoutes from './customer.routes';
import orderRoutes from './order.routes';
import surveyRoutes from './survey.routes';
import inventoryRoutes from './inventory.routes';
import fieldRoutes from './field.routes';
import attendanceRoutes from './attendance.routes';
import { paymentRouter, settlementRouter, quotationRouter } from './payment.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'BNWEMS API is running.', timestamp: new Date().toISOString() });
});

// Module routes
router.use('/auth', authRoutes);
router.use('/admin/users', userRoutes);
router.use('/admin/policies', policyRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);
router.use('/surveys', surveyRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/operations', inventoryRoutes);
router.use('/field', fieldRoutes);
router.use('/payments', paymentRouter);
router.use('/settlements', settlementRouter);
router.use('/quotations', quotationRouter);
router.use('/attendance', attendanceRoutes);

export default router;
