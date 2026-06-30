import { Router } from 'express';
import * as changerequestController from '../controllers/changerequest.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

export const nestedChangeRequestRouter = Router({ mergeParams: true });
nestedChangeRequestRouter.use(authenticate);
nestedChangeRequestRouter.use(authorizeRoles('ADMIN', 'MANAGER'));

import { validate } from '../middlewares/validate.middleware';
import { createChangeRequestSchema, approveChangeRequestSchema, getChangeRequestsSchema, getChangeRequestByIdSchema } from '../validators/changerequest.validator';

nestedChangeRequestRouter.get('/', validate(getChangeRequestsSchema), changerequestController.getChangeRequests);
nestedChangeRequestRouter.post('/', validate(createChangeRequestSchema), changerequestController.createChangeRequest);

export const changeRequestRouter = Router();
changeRequestRouter.use(authenticate);
changeRequestRouter.use(authorizeRoles('ADMIN', 'MANAGER'));
changeRequestRouter.get('/', validate(getChangeRequestsSchema), changerequestController.getChangeRequests);
changeRequestRouter.get('/:id', validate(getChangeRequestByIdSchema), changerequestController.getChangeRequestById);
changeRequestRouter.put('/:id/approve', validate(approveChangeRequestSchema), changerequestController.approveChangeRequest);
