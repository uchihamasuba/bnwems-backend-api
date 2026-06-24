import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const assignStaff = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params; // WorkTask ID
    const { assignments } = req.body;

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return next(new AppError('Staff assignment information is missing.', 400, 'MSG-UC53-05'));
    }

    const task = await prisma.workTask.findUnique({ where: { id } });
    if (!task) return next(new AppError('Task not found', 404));

    // Clear existing assignments for this task and recreate
    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: { assignment: { workTaskId: id } },
      });
      await tx.assignment.deleteMany({
        where: { workTaskId: id },
      });

      for (const assign of assignments) {
        await tx.assignment.create({
          data: {
            workTaskId: id,
            userId: assign.userId,
            assignedRole: assign.assignedRole,
          },
        });

        // Trigger notification to user (UC 2.3)
        await tx.notification.create({
          data: {
            userId: assign.userId,
            title: 'New Task Assignment',
            content: `You have been assigned to task ${task.taskType} at ${task.location}.`,
          },
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Staff assigned and notified.',
    });
  } catch (error) {
    next(error);
  }
};
