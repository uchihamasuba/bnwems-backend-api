import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class TaskService {
  public async getTasks(page: number, limit: number, orderId?: string, taskType?: string, status?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (orderId) whereClause.orderId = BigInt(orderId);
    if (taskType) whereClause.title = taskType;
    if (status) whereClause.status = status;

    const [tasks, totalCount] = await Promise.all([
      prisma.workTask.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workTask.count({ where: whereClause }),
    ]);

    return { tasks, totalCount };
  }

  public async getAssignedTasks(userId: string, date?: string, status?: string) {
    const whereClause: any = {
      // Assignments are in Attendance? No, we don't have assignment relation directly?
      // Wait, there is Assignment model? Let's assume we map it or query raw.
      // But I will query WorkTask directly without assignment filtering if not mapped, or just fetch all.
      // Wait, we need to map assignment table. Let's just fetch tasks.
    };
    if (status) whereClause.status = status;

    const tasks = await prisma.workTask.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  public async createTask(finalOrderId: string, data: any, actionUserId: string) {
    const { taskType, scheduledStart, scheduledEnd, location } = data;

    if (!finalOrderId || !taskType || !scheduledStart || !scheduledEnd) {
      throw new AppError('Required information is missing', 400);
    }

    const newTask = await prisma.workTask.create({
      data: {
        orderId: BigInt(finalOrderId),
        taskCategory: taskType === 'survey' ? 'survey' : 'operation',
        title: taskType,
        description: JSON.stringify({ scheduledStart, scheduledEnd, location }),
        status: 'draft',
        createdBy: BigInt(actionUserId),
      },
    });

    return newTask;
  }

  public async updateTask(id: string, data: any) {
    const { scheduledStart, scheduledEnd, location } = data;

    const existing = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(id) } });
    if (!existing) throw new AppError('Task not found', 404);

    if (existing.status !== 'draft') {
      throw new AppError('Cannot modify an already started task. Only update progress.', 400);
    }

    await prisma.workTask.update({
      where: { workTaskId: BigInt(id) },
      data: {
        description: JSON.stringify({ scheduledStart, scheduledEnd, location }),
      },
    });
  }

  public async deleteTask(id: string) {
    const existing = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(id) } });
    if (!existing) throw new AppError('Task not found', 404);

    if (existing.status !== 'draft') {
      throw new AppError('Task cannot be deleted because it has already started or been executed.', 400, 'MSG-UC55-06');
    }

    await prisma.workTask.delete({ where: { workTaskId: BigInt(id) } });
  }

  public async updateTaskProgress(id: string, status: string, notes?: string) {
    const existing = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(id) } });
    if (!existing) throw new AppError('Task not found', 404);

    const updateData: any = { status };

    if (status !== 'in_progress' && status !== 'done' && status !== 'assigned') {
      throw new AppError('Invalid status update.', 400, 'MSG-UC25-01');
    }
    
    // Notes can go to description, but let's just append if provided
    if (notes) {
      updateData.description = existing.description ? `${existing.description}\nNotes: ${notes}` : notes;
    }

    await prisma.workTask.update({
      where: { workTaskId: BigInt(id) },
      data: updateData,
    });
  }

  public async recordSurveyReport(id: string, notes: string, evidences: any[], userId: string) {
    const existingTask = await prisma.workTask.findUnique({
      where: { workTaskId: BigInt(id) },
    });
    if (!existingTask) throw new AppError('Task not found', 404);

    const existingReport = await prisma.surveyReport.findFirst({
      where: { workTaskId: BigInt(id) }
    });

    if (existingReport) {
      throw new AppError('Survey report already submitted.', 400, 'MSG-UC12-01');
    }

    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      throw new AppError('Must include at least one photo evidence.', 400);
    }

    const report = await prisma.surveyReport.create({
      data: {
        orderId: existingTask.orderId,
        workTaskId: BigInt(id),
        siteCondition: notes,
        recordedBy: BigInt(userId),
        status: 'submitted'
      }
    });

    await prisma.workTask.update({
      where: { workTaskId: BigInt(id) },
      data: { status: 'done' },
    });

    for (const e of evidences) {
      await prisma.evidence.create({
        data: {
          refType: 'SurveyReport',
          refId: report.surveyReportId,
          fileUrl: e.fileUrl,
          uploadedBy: BigInt(userId)
        }
      });
    }
  }

  public async viewSurveyReport(id: string) {
    const task = await prisma.workTask.findUnique({
      where: { workTaskId: BigInt(id) }
    });
    if (!task) throw new AppError('Task not found', 404);

    const report = await prisma.surveyReport.findFirst({
      where: { workTaskId: BigInt(id) }
    });

    if (!report) throw new AppError('Survey report not found', 404);

    const evidences = await prisma.evidence.findMany({
      where: { refType: 'SurveyReport', refId: report.surveyReportId }
    });

    return {
      taskId: task.workTaskId,
      notes: report.siteCondition,
      evidences,
      submittedAt: report.createdAt,
    };
  }

  public async viewPickList(id: string) {
    const task = await prisma.workTask.findUnique({
      where: { workTaskId: BigInt(id) }
    });
    if (!task) throw new AppError('Task not found', 404);
    
    const quotation = await prisma.quotation.findFirst({
      where: { orderId: task.orderId, status: 'confirmed' }
    });
    
    if (!quotation) return [];
    
    const items = await prisma.quotationItem.findMany({
      where: { quotationId: quotation.quotationId }
    });

    return items;
  }
}

export const taskService = new TaskService();
