import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

import * as scheduleController from '../controllers/schedule.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), scheduleController.getSchedules);

export default router;
