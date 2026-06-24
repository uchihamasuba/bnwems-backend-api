import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { assignmentService } from '../services/assignment.service';

export const assignStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // WorkTask ID
    const { assignments } = req.body;

    await assignmentService.assignStaff(id, assignments);

    res.status(200).json({
      success: true,
      message: 'Staff assigned and notified.',
    });
  } catch (error) {
    next(error);
  }
};
