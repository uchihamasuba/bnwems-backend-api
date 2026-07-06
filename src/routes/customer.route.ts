import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { quotationController } from '../controllers/quotation.controller';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../middlewares/validate.middleware';
import {
  getCustomersSchema,
  getCustomerByIdSchema,
  createCustomerSchema,
  updateCustomerSchema,
} from '../validators/customer.validator';
import {
  getCustomerQuotationsSchema,
  createQuotationSchema,
} from '../validators/quotation.validator';

const router = Router();

router.use(protect);
router.use(restrictTo(Role.ADMIN, Role.MANAGER));

router.get('/', validate(getCustomersSchema), customerController.getCustomers);
router.get('/:id', validate(getCustomerByIdSchema), customerController.getCustomerById);
router.post('/', validate(createCustomerSchema), customerController.createCustomer);
router.put('/:id', validate(updateCustomerSchema), customerController.updateCustomer);

router.get('/:customerId/quotations', validate(getCustomerQuotationsSchema), quotationController.getCustomerQuotations);
router.post('/:customerId/quotations', validate(createQuotationSchema), quotationController.createQuotation);

export default router;
