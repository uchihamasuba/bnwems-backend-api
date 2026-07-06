import { Request, Response, NextFunction } from 'express';

export const notificationController = {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        code: 'MSG-NT-01',
        data: [],
        meta: { page: 1, limit: 20, totalCount: 0 },
      });
    } catch (error) {
      next(error);
    }
  },

  async readNotification(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        code: 'MSG-NT-02',
        message: 'Đánh dấu đã đọc thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async readAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        success: true,
        code: 'MSG-NT-03',
        message: 'Đã đánh dấu đọc tất cả.',
      });
    } catch (error) {
      next(error);
    }
  },
};
