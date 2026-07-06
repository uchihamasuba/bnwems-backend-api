import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  createSupplierTransactionSchema,
  getSupplierTransactionsSchema,
  getSupplierTransactionByIdSchema,
  updateSupplierTransactionStatusSchema,
  updateSupplierTransactionPaymentStatusSchema,
  receiveSupplierTransactionSchema,
} from '../validators/supplier.validator';

const router = Router();

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(createSupplierTransactionSchema),
  supplierController.createSupplierTransaction,
);

router.get(
  '/',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getSupplierTransactionsSchema),
  supplierController.getSupplierTransactions,
);

router.get(
  '/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getSupplierTransactionByIdSchema),
  supplierController.getSupplierTransactionById,
);

router.patch(
  '/:id/status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateSupplierTransactionStatusSchema),
  supplierController.updateSupplierTransactionStatus,
);

router.patch(
  '/:id/payment-status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateSupplierTransactionPaymentStatusSchema),
  supplierController.updateSupplierTransactionPaymentStatus,
);

router.post(
  '/:id/receive',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(receiveSupplierTransactionSchema),
  supplierController.receiveSupplierTransaction,
);

export default router;
