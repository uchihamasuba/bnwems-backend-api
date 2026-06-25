import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class AssignmentService {
  public async assignStaff(taskId: string, assignments: any[]) {
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      throw new AppError('Staff assignment information is missing.', 400, 'MSG-UC53-05');
    }

    const task = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(taskId) } });
    if (!task) throw new AppError('Task not found', 404);

    await prisma.$transaction(async (tx) => {
      const existingAssignments = await tx.assignment.findMany({
        where: { workTaskId: BigInt(taskId) }
      });
      const assignmentIds = existingAssignments.map(a => a.assignmentId);

      if (assignmentIds.length > 0) {
        await tx.attendance.deleteMany({
          where: { assignmentId: { in: assignmentIds } },
        });
      }

      await tx.assignment.deleteMany({
        where: { workTaskId: BigInt(taskId) },
      });

      for (const assign of assignments) {
        await tx.assignment.create({
          data: {
            workTaskId: BigInt(taskId),
            userId: BigInt(assign.userId),
            roleInTask: assign.assignedRole,
          },
        });

        // Trigger notification to user (UC 2.3)
        await tx.notification.create({
          data: {
            userId: BigInt(assign.userId),
            type: 'TASK_ASSIGNMENT',
            title: 'New Task Assignment',
            content: `You have been assigned to task ${task.title}.`,
          },
        });
      }
    });
  }
}

export const assignmentService = new AssignmentService();
