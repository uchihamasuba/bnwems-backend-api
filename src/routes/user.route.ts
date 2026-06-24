import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication and ADMIN role check to all user management routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/status', userController.updateStatus);
router.post('/:id/reset-password', userController.resetPassword);

export default router;
