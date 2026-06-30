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
  paySupplierDebtSchema,
  getSupplierTransactionsSchema,
  getSupplierTransactionByIdSchema,
  updateSupplierTxStatusSchema
} from '../validators/suppliertx.validator';

// Supplier Transactions
router.get('/supplier-transactions', validate(getSupplierTransactionsSchema), suppliertxController.getSupplierTransactions);
router.get('/supplier-transactions/:id', validate(getSupplierTransactionByIdSchema), suppliertxController.getSupplierTransactionById);
router.post('/supplier-transactions', validate(createSupplierTransactionSchema), suppliertxController.createSupplierTransaction);
router.put('/supplier-transactions/:id/status', validate(updateSupplierTxStatusSchema), suppliertxController.updateSupplierTxStatus);
router.put('/supplier-transactions/:id/receive', validate(receiveSupplierItemsSchema), suppliertxController.receiveSupplierItems);
router.put('/supplier-transactions/:id/return', validate(returnSupplierItemsSchema), suppliertxController.returnSupplierItems);
router.post('/supplier-transactions/:id/payments', validate(paySupplierDebtSchema), suppliertxController.paySupplierTransaction);



export default router;
