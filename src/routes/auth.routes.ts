import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validation.middleware';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', validateBody(['username', 'password']), authController.login);

// PUT /api/v1/auth/change-password
router.put(
  '/change-password',
  verifyToken,
  validateBody(['oldPassword', 'newPassword']),
  authController.changePassword
);

export default router;
