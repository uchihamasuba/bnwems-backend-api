import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/forgot-password/verify', authController.verifyForgotPasswordOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh', verifyToken, authController.refresh);

export default router;