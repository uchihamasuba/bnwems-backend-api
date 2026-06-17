import { Request, Response, NextFunction } from 'express';
import { fieldService } from '../services/field.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const fieldController = {
  async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await fieldService.updateProgress(req.body);
      res.status(200).json({ success: true, statusCode: 200, message: 'Cập nhật tiến độ thi công công trường thành công.' });
    } catch (err) { next(err); }
  },

  async submitChangeRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await fieldService.submitChangeRequest({ ...req.body, submittedByLeaderId: req.user!.userId });
      res.status(201).json({ success: true, statusCode: 201, message: 'Yêu cầu điều chỉnh thiết bị thực địa đã được gửi đi và chờ Manager phê duyệt.' });
    } catch (err) { next(err); }
  },

  async approveChangeRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await fieldService.approveChangeRequest(Number(req.params.id), req.body);
      res.status(200).json({ success: true, statusCode: 200, message: 'Đã xử lý phê duyệt yêu cầu thay đổi vật tư thực địa thành công.' });
    } catch (err) { next(err); }
  },
};
