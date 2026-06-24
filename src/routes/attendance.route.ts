import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/check-in', authorizeRoles('TECHNICAL_STAFF'), attendanceController.checkIn);
router.put('/:id/confirm', authorizeRoles('ADMIN', 'MANAGER', 'LEADER_STAFF'), attendanceController.confirmAttendance);

export default router;
