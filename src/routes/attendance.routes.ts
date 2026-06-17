import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// POST /api/v1/attendance/record
router.post('/record', requireRole('Leader Staff'), attendanceController.recordAttendance);

export default router;
