import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class TaskService {
  public async getTasks(page: number, limit: number, orderId?: string, taskType?: string, status?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (orderId) whereClause.orderId = orderId;
    if (taskType) whereClause.taskType = taskType;
    if (status) whereClause.status = status;

    const [tasks, totalCount] = await Promise.all([
      prisma.workTask.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { scheduledStart: 'asc' },
      }),
      prisma.workTask.count({ where: whereClause }),
    ]);

    return { tasks, totalCount };
  }

  public async getAssignedTasks(userId: string, date?: string, status?: string) {
    const whereClause: any = {
      assignments: { some: { userId } },
    };
    if (status) whereClause.status = status;
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      whereClause.scheduledStart = {
        gte: targetDate,
        lt: nextDate,
      };
    }

    const tasks = await prisma.workTask.findMany({
      where: whereClause,
      orderBy: { scheduledStart: 'asc' },
    });

    return tasks;
  }

  public async createTask(finalOrderId: string, data: any) {
    const { taskType, scheduledStart, scheduledEnd, location } = data;

    if (!finalOrderId || !taskType || !scheduledStart || !scheduledEnd) {
      throw new AppError('Required information is missing', 400);
    }

    const newTask = await prisma.workTask.create({
      data: {
        orderId: finalOrderId,
        taskType,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        location,
        status: 'PENDING',
      },
    });

    return newTask;
  }

  public async updateTask(id: string, data: any) {
    const { scheduledStart, scheduledEnd, location } = data;

    const existing = await prisma.workTask.findUnique({ where: { id } });
    if (!existing) throw new AppError('Task not found', 404);

    if (existing.status !== 'PENDING') {
      throw new AppError('Cannot modify an already started task. Only update progress.', 400);
    }

    await prisma.workTask.update({
      where: { id },
      data: {
        scheduledStart: scheduledStart ? new Date(scheduledStart) : existing.scheduledStart,
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : existing.scheduledEnd,
        location: location || existing.location,
      },
    });
  }

  public async deleteTask(id: string) {
    const existing = await prisma.workTask.findUnique({ where: { id } });
    if (!existing) throw new AppError('Task not found', 404);

    if (existing.status !== 'PENDING') {
      throw new AppError('Task cannot be deleted because it has already started or been executed.', 400, 'MSG-UC55-06');
    }

    await prisma.workTask.delete({ where: { id } });
  }

  public async updateTaskProgress(id: string, status: string, notes?: string) {
    const existing = await prisma.workTask.findUnique({ where: { id } });
    if (!existing) throw new AppError('Task not found', 404);

    const updateData: any = { status, notes };

    if (status === 'IN_PROGRESS' && existing.status === 'PENDING') {
      updateData.actualStart = new Date();
    } else if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.actualEnd = new Date();
    } else if (status !== 'IN_PROGRESS' && status !== 'COMPLETED') {
      throw new AppError('Invalid status update.', 400, 'MSG-UC25-01');
    }

    await prisma.workTask.update({
      where: { id },
      data: updateData,
    });
  }

  public async recordSurveyReport(id: string, notes: string, evidences: any[], userId: string) {
    const existingTask = await prisma.workTask.findUnique({
      where: { id },
      include: { evidences: true },
    });
    if (!existingTask) throw new AppError('Task not found', 404);

    if (existingTask.evidences.length > 0) {
      throw new AppError('Survey report already submitted.', 400, 'MSG-UC12-01');
    }

    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      throw new AppError('Must include at least one photo evidence.', 400);
    }

    await prisma.workTask.update({
      where: { id },
      data: {
        notes,
        status: 'COMPLETED',
        actualEnd: new Date(),
        evidences: {
          create: evidences.map((e: any) => ({
            fileUrl: e.fileUrl,
            evidenceType: 'SURVEY_PHOTO',
            uploadedBy: userId,
          })),
        },
      },
    });
  }

  public async viewSurveyReport(id: string) {
    const task = await prisma.workTask.findUnique({
      where: { id },
      include: { evidences: true },
    });

    if (!task) throw new AppError('Task not found', 404);

    return {
      taskId: task.id,
      notes: task.notes,
      evidences: task.evidences,
      submittedAt: task.actualEnd || task.updatedAt,
    };
  }

  public async viewPickList(id: string) {
    const task = await prisma.workTask.findUnique({
      where: { id },
      include: { order: { include: { quotations: { where: { status: 'ACCEPTED' } } } } },
    });

    if (!task) throw new AppError('Task not found', 404);
    
    const quotation = task.order.quotations[0];
    let items: any[] = [];
    if (quotation && quotation.details && (quotation.details as any).items) {
      items = (quotation.details as any).items;
    }

    return items;
  }
}

export const taskService = new TaskService();
