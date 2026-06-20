import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class TaskController {
  static async updateTaskProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await TaskService.updateTaskProgress(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã cập nhật tiến độ', result, 'MSG-FLDP-01');
    } catch (error) { next(error); }
  }
}
