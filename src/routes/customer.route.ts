import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getCustomersSchema, getCustomerByIdSchema, createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

router.get('/', validate(getCustomersSchema), customerController.getCustomers);
router.get('/:id', validate(getCustomerByIdSchema), customerController.getCustomerById);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', validate(updateCustomerSchema), customerController.updateCustomer);

export default router;
