import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

export const nestedPaymentRouter = Router({ mergeParams: true });
nestedPaymentRouter.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import { getPaymentsByOrderSchema, requestPaymentSchema, confirmPaymentSchema } from '../validators/payment.validator';

nestedPaymentRouter.get('/', authorizeRoles('ADMIN', 'MANAGER'), validate(getPaymentsByOrderSchema), paymentController.getPaymentsByOrder);
nestedPaymentRouter.post('/request', authorizeRoles('ADMIN', 'MANAGER'), validate(requestPaymentSchema), paymentController.requestPayment);

export const paymentRouter = Router();
paymentRouter.use(authenticate);
paymentRouter.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER'), validate(confirmPaymentSchema), paymentController.confirmPayment);
