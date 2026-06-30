import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getUsersSchema, createUserSchema, updateUserSchema, updateStatusSchema, resetPasswordSchema } from '../validators/user.validator';

const router = Router();

// Apply authentication and ADMIN role check to all user management routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/', validate(getUsersSchema), userController.getUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.patch('/:id/status', validate(updateStatusSchema), userController.updateStatus);
router.post('/:id/reset-password', validate(resetPasswordSchema), userController.resetPassword);

export default router;
