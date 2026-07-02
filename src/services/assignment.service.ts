import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class AssignmentService {
  public async getAssignmentsByOrder(orderId: string) {
    const assignments = await prisma.assignment.findMany({
      where: {
        workTask: {
          orderId: BigInt(orderId)
        }
      },
      include: {
        workTask: true,
        user: true
      }
    });

    return assignments.map(a => ({
      assignmentId: a.assignmentId.toString(),
      workTaskId: a.workTaskId.toString(),
      userId: a.userId.toString(),
      assignedRole: a.roleInTask,
      fieldStatus: a.fieldStatus,
      fullName: a.user?.fullName || '',
      taskTitle: a.workTask?.title || ''
    }));
  }
  public async assignStaff(taskId: string, assignments: any[]) {
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      throw new AppError('Thiếu thông tin phân công nhân viên.', 400, 'MSG-UC53-05');
    }

    const task = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(taskId) } });
    if (!task) throw new AppError('Không tìm thấy công việc.', 404);

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
