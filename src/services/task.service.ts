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
      userId: BigInt(userId)
    };
    
    if (status) {
      whereClause.workTask = { status };
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        workTask: true
      },
      orderBy: { assignedAt: 'desc' },
    });

    const tasks = assignments.map(a => ({
      ...a.workTask,
      fieldStatus: a.fieldStatus
    }));

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

  public async cancelTask(id: string, status: string) {
    const existing = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(id) } });
    if (!existing) throw new AppError('Task not found', 404);

    if (existing.status !== 'draft' && existing.status !== 'pending') {
      throw new AppError('Task cannot be deleted because it has already started or been executed.', 400, 'MSG-UC55-06');
    }

    if (status === 'cancelled' || status === 'deleted') {
      await prisma.workTask.update({ 
        where: { workTaskId: BigInt(id) },
        data: { status: 'cancelled' }
      });
    } else {
      throw new AppError('Invalid status for cancellation.', 400);
    }
  }

  public async updateTaskProgress(id: string, status: string, notes?: string, progressPercent?: number) {
    const existing = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(id) } });
    if (!existing) throw new AppError('Task not found', 404);

    const updateData: any = { status };
    if (progressPercent !== undefined) updateData.progressPercent = progressPercent;

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
          orderId: report.orderId,
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

    return items.map(i => ({
      ...i,
      quotationItemId: i.id.toString(),
      quotationId: i.quotationId.toString(),
      equipmentItemId: i.equipmentItemId.toString()
    }));
  }

  public async reviewSurveyReport(id: string, status: string, userId: string) {
    const report = await prisma.surveyReport.findFirst({
      where: { workTaskId: BigInt(id) }
    });

    if (!report) throw new AppError('Survey report not found', 404);
    if (report.status === 'approved') throw new AppError('Report already approved', 400);

    await prisma.surveyReport.update({
      where: { surveyReportId: report.surveyReportId },
      data: {
        status: status,
      }
    });
  }
}

export const taskService = new TaskService();
