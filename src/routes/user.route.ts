import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import {
  verifyToken as protect,
  authorizeRoles as restrictTo,
} from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';
import { validate } from '../middlewares/validate.middleware';
import {
  getUsersSchema,
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  resetPasswordSchema,
} from '../validators/user.validator';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Apply authentication and ADMIN role check to all user management routes
router.use(protect);
// Do not apply global ADMIN check to allow MANAGER on GET
// router.use(restrictTo(Role.ADMIN));

router.get(
  '/',
  restrictTo(Role.ADMIN, Role.MANAGER),
  validate(getUsersSchema),
  userController.getUsers,
);
router.post('/', restrictTo(Role.ADMIN), validate(createUserSchema), userController.createUser);
router.put('/:id', restrictTo(Role.ADMIN), validate(updateUserSchema), userController.updateUser);
router.patch(
  '/:id/status',
  restrictTo(Role.ADMIN),
  validate(updateStatusSchema),
  userController.updateStatus,
);
router.post(
  '/:id/reset-password',
  restrictTo(Role.ADMIN),
  validate(resetPasswordSchema),
  userController.resetPassword,
);
router.post('/:id/avatar', upload.single('file'), userController.updateAvatar);

export default router;
