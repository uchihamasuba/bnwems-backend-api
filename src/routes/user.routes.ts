import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { verifyToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Require auth for all
router.use(verifyToken);

// Admin Routes for Users Management
router.get('/', authorizeRoles('Admin'), userController.getAllUsers);
router.post('/', authorizeRoles('Admin'), userController.createUser);
router.put('/:id', authorizeRoles('Admin'), userController.updateUser);
router.patch('/:id/status', authorizeRoles('Admin'), userController.updateUserStatus);
router.post('/:id/reset-password', authorizeRoles('Admin'), userController.resetPassword);
router.patch('/:id/role', authorizeRoles('Admin'), userController.assignRole);

export default router;