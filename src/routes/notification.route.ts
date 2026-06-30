import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

import { validate } from '../middlewares/validate.middleware';
import { getNotificationsSchema, markAsReadSchema } from '../validators/notification.validator';

router.get('/', validate(getNotificationsSchema), notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', validate(markAsReadSchema), notificationController.markAsRead);

export default router;
