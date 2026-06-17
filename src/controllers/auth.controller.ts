import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const result = await authService.login({ username, password });
      res.status(200).json({ success: true, statusCode: 200, data: result });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword({ userId: req.user!.userId, oldPassword, newPassword });
      res.status(200).json({ success: true, statusCode: 200, message: 'Thay đổi mật khẩu thành công.' });
    } catch (err) {
      next(err);
    }
  },
};
