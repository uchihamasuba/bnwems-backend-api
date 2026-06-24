import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class AssignmentService {
  public async assignStaff(taskId: string, assignments: any[]) {
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      throw new AppError('Staff assignment information is missing.', 400, 'MSG-UC53-05');
    }

    const task = await prisma.workTask.findUnique({ where: { id: taskId } });
    if (!task) throw new AppError('Task not found', 404);

    await prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: { assignment: { workTaskId: taskId } },
      });
      await tx.assignment.deleteMany({
        where: { workTaskId: taskId },
      });

      for (const assign of assignments) {
        await tx.assignment.create({
          data: {
            workTaskId: taskId,
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
  }
}

export const assignmentService = new AssignmentService();
