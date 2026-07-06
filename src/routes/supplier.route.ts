import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getSuppliersSchema,
  createSupplierSchema,
  updateSupplierSchema,
  createSupplierTransactionSchema,
  getSupplierTransactionsSchema,
  getSupplierTransactionByIdSchema,
  updateSupplierTransactionStatusSchema,
  updateSupplierTransactionPaymentStatusSchema,
  receiveSupplierTransactionSchema,
} from '../validators/supplier.validator';

const router = Router();

// ============================================================================
// SUPPLIERS
// ============================================================================

router.get(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getSuppliersSchema),
  supplierController.getSuppliers,
);

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(createSupplierSchema),
  supplierController.createSupplier,
);

router.put(
  '/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateSupplierSchema),
  supplierController.updateSupplier,
);

// ============================================================================
// SUPPLIER TRANSACTIONS (Moved to supplier-transaction.route.ts)
// ============================================================================

export default router;
