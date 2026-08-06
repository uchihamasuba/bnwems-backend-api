import { Router } from 'express';
import { quotationController } from '../controllers/quotation.controller';
import { validate } from '../middlewares/validate.middleware';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import {
  getQuotationByIdSchema,
  createQuotationSchema,
  updateQuotationSchema,
  updateQuotationStatusSchema,
  deleteQuotationSchema,
} from '../validators/quotation.validator';

const router = Router();

router.get('/:id', protect, validate(getQuotationByIdSchema), quotationController.getQuotationById);

router.put(
  '/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateQuotationSchema),
  quotationController.updateQuotation,
);

router.patch(
  '/:id/status',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(updateQuotationStatusSchema),
  quotationController.updateQuotationStatus,
);

router.delete(
  '/:id',
  protect,
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(deleteQuotationSchema),
  quotationController.deleteQuotation,
);

export default router;
