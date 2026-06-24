import { Router } from 'express';
import * as quotationController from '../controllers/quotation.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

export const nestedQuotationRouter = Router({ mergeParams: true });
nestedQuotationRouter.use(authenticate);
nestedQuotationRouter.use(authorizeRoles('ADMIN', 'MANAGER'));

import { validate } from '../middlewares/validate.middleware';
import { getQuotationsByOrderSchema, getQuotationByIdSchema, createQuotationSchema, updateQuotationSchema, deleteQuotationSchema, confirmQuotationSchema } from '../validators/quotation.validator';

nestedQuotationRouter.get('/', validate(getQuotationsByOrderSchema), quotationController.getQuotationsByOrder);
nestedQuotationRouter.post('/', validate(createQuotationSchema), quotationController.createQuotation);

export const quotationRouter = Router();
quotationRouter.use(authenticate);
quotationRouter.use(authorizeRoles('ADMIN', 'MANAGER'));
quotationRouter.get('/:id', validate(getQuotationByIdSchema), quotationController.getQuotationById);
quotationRouter.put('/:id', validate(updateQuotationSchema), quotationController.updateQuotation);
quotationRouter.delete('/:id', validate(deleteQuotationSchema), quotationController.deleteQuotation);
quotationRouter.put('/:id/confirm', validate(confirmQuotationSchema), quotationController.confirmQuotation);
