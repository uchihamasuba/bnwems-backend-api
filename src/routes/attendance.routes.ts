import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.post('/', AttendanceController.checkIn);
router.patch('/:id/check-out', AttendanceController.checkOut);
router.post('/:id/verify', authorizeRoles('admin', 'manager', 'leader_staff'), AttendanceController.verifyAttendance);

export default router;