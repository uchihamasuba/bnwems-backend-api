import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import { checkInSchema, confirmAttendanceSchema } from '../validators/attendance.validator';

router.post('/check-in', authorizeRoles('TECHNICAL_STAFF'), validate(checkInSchema), attendanceController.checkIn);
router.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), validate(confirmAttendanceSchema), attendanceController.confirmAttendance);

export default router;
