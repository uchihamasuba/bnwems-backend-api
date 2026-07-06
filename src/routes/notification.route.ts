import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { verifyToken as protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.readAllNotifications);
router.put('/:id/read', notificationController.readNotification);

export default router;
