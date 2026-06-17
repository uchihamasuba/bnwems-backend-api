import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// GET /api/v1/orders
router.get('/', requireRole('Manager', 'Administrator'), orderController.getOrders);

// GET /api/v1/orders/:id
router.get('/:id', requireRole('Manager', 'Administrator', 'Leader Staff', 'Technical Staff'), orderController.getOrderById);

// POST /api/v1/orders
router.post('/', requireRole('Manager'), orderController.createOrder);

// POST /api/v1/orders/:id/quotations
router.post('/:id/quotations', requireRole('Manager'), orderController.createQuotation);

export default router;
