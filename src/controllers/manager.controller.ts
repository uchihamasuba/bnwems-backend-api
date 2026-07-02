import { Request, Response, NextFunction } from 'express';
import { managerService } from '../services/manager.service';

class ManagerController {
  public async getPendingApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await managerService.getPendingApprovals();
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách chờ phê duyệt thành công.',
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

export const managerController = new ManagerController();
