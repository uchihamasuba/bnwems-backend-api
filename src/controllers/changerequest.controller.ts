import { Request, Response, NextFunction } from 'express';
import { ChangeRequestService } from '../services/changerequest.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ChangeRequestController {
  static async reviewChangeRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { decision, review_notes } = req.body;
      const result = await ChangeRequestService.reviewChangeRequest(req.params.id, decision, review_notes, req.user!.userId);
      sendSuccess(res, 'Đã duyệt yêu cầu thay đổi', result, 'MSG-CR-01');
    } catch (error) { next(error); }
  }
}
