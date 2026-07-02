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
      message: 'Đã phân công và thông báo cho nhân viên.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const assignments = await assignmentService.getAssignmentsByOrder(orderId);

    res.status(200).json({
      success: true,
      data: assignments
    });
  } catch (error) {
    next(error);
  }
};
