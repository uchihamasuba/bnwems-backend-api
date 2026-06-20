import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class AssignmentService {
  static async getAssignmentById(id: string, userId: string, role: string) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: BigInt(id) },
      include: { order: true }
    });

    if (!assignment) throw new AppError('Assignment not found', 404);
    
    // Check permission: user can only view their own assignment, unless admin/manager
    if (role !== 'admin' && role !== 'manager' && assignment.userId !== BigInt(userId)) {
      throw new AppError('Forbidden', 403);
    }

    // Mock tasks for now, as tasks are not fully modeled in Prisma schema under assignments
    return {
      id: Number(assignment.id),
      order_id: Number(assignment.orderId),
      assigned_date: assignment.assignedDate,
      session_type: assignment.sessionType,
      status: assignment.status,
      tasks: [
        { id: 80, title: "Vận chuyển thiết bị", status: "todo", priority: "high" },
        { id: 81, title: "Lắp đặt sân khấu", status: "todo", priority: "medium" }
      ]
    };
  }
}
