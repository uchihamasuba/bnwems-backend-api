import { Router } from 'express';
import * as suppliertxController from '../controllers/suppliertx.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN', 'MANAGER'));

import { validate } from '../middlewares/validate.middleware';
import {
  createSupplierTransactionSchema,
  receiveSupplierItemsSchema,
  returnSupplierItemsSchema,
  getSupplierDebtsSchema,
  paySupplierDebtSchema
} from '../validators/suppliertx.validator';

// Supplier Transactions
router.post('/supplier-transactions', validate(createSupplierTransactionSchema), suppliertxController.createSupplierTransaction);
router.put('/supplier-transactions/:id/receive', validate(receiveSupplierItemsSchema), suppliertxController.receiveSupplierItems);
router.put('/supplier-transactions/:id/return', validate(returnSupplierItemsSchema), suppliertxController.returnSupplierItems);

// Supplier Debts
router.get('/supplier-debts', validate(getSupplierDebtsSchema), suppliertxController.getSupplierDebts);
router.post('/supplier-debts/:id/pay', validate(paySupplierDebtSchema), suppliertxController.paySupplierDebt);

export default router;
