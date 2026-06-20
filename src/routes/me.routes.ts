import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.put('/me/password', userController.changePassword);
router.get('/my/assignments', userController.getAssignments);

export default router;
