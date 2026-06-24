import { Router } from 'express';
import * as settlementController from '../controllers/settlement.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

export const nestedSettlementRouter = Router({ mergeParams: true });
nestedSettlementRouter.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import { recordSettlementSchema, confirmSettlementSchema } from '../validators/settlement.validator';

nestedSettlementRouter.post('/', authorizeRoles('LEADER_STAFF', 'MANAGER'), validate(recordSettlementSchema), settlementController.recordSettlement);

export const settlementRouter = Router();
settlementRouter.use(authenticate);
settlementRouter.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER'), validate(confirmSettlementSchema), settlementController.confirmSettlement);
