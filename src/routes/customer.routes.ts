import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/', authorizeRoles('admin', 'sales'), CustomerController.createCustomer);
router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.put('/:id', authorizeRoles('admin', 'sales'), CustomerController.updateCustomer);

export default router;