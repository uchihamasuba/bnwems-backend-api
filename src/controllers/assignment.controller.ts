import { Request, Response, NextFunction } from 'express';
import { AssignmentService } from '../services/assignment.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AssignmentController {
  static async getAssignmentById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await AssignmentService.getAssignmentById(req.params.id, req.user!.userId, req.user!.role);
      sendSuccess(res, 'Chi tiết nhiệm vụ', result);
    } catch (error) { next(error); }
  }
}
