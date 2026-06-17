import { Router } from 'express';
import { customerController } from '../controllers/customer.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken, requireRole('Manager'));

// GET /api/v1/customers
router.get('/', customerController.getCustomers);

// GET /api/v1/customers/:id
router.get('/:id', customerController.getCustomerById);

// POST /api/v1/customers
router.post('/', customerController.createCustomer);

export default router;
