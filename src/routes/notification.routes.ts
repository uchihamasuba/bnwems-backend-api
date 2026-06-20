import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', userController.getNotifications);
router.patch('/:id/read', userController.markNotificationRead);

export default router;
