import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getUsersSchema, createUserSchema, updateUserSchema, updateStatusSchema, resetPasswordSchema } from '../validators/user.validator';

const router = Router();

// Apply authentication and ADMIN role check to all user management routes
router.use(authenticate);
// Do not apply global ADMIN check to allow MANAGER on GET
// router.use(authorizeRoles('ADMIN'));

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), validate(getUsersSchema), userController.getUsers);
router.post('/', authorizeRoles('ADMIN'), validate(createUserSchema), userController.createUser);
router.put('/:id', authorizeRoles('ADMIN'), validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', authorizeRoles('ADMIN'), validate(updateStatusSchema), userController.updateStatus);
router.post('/:id/reset-password', authorizeRoles('ADMIN'), validate(resetPasswordSchema), userController.resetPassword);

export default router;
