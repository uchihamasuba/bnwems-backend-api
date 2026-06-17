import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const userController = {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.getUsers({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string | undefined,
        roleId: req.query.roleId ? Number(req.query.roleId) : undefined,
      });
      res.status(200).json({ success: true, statusCode: 200, ...result });
    } catch (err) {
      next(err);
    }
  },

  async createUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Tài khoản người dùng đã được khởi tạo thành công (MSG-AU06).',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async deactivateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await userService.deactivateUser(Number(req.params.id), req.user!.userId);
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Đã vô hiệu hóa tài khoản người dùng thành công (MSG-DU04).',
      });
    } catch (err) {
      next(err);
    }
  },
};
