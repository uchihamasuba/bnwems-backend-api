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
      throw new AppError('Thiếu thông tin bắt buộc.', 400);
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
    if (!existing) throw new AppError('Không tìm thấy công việc.', 404);

    if (existing.status !== 'draft') {
      throw new AppError('Không thể thay đổi công việc đã bắt đầu. Chỉ có thể cập nhật tiến độ.', 400);
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
    if (!existing) throw new AppError('Không tìm thấy công việc.', 404);

    if (existing.status !== 'draft' && existing.status !== 'pending') {
      throw new AppError('Không thể xóa công việc vì nó đã bắt đầu hoặc đã thực hiện xong.', 400, 'MSG-UC55-06');
    }

    if (status === 'cancelled' || status === 'deleted') {
      await prisma.workTask.update({ 
        where: { workTaskId: BigInt(id) },
        data: { status: 'cancelled' }
      });
    } else {
      throw new AppError('Trạng thái không hợp lệ để hủy.', 400);
    }
  }

  public async updateTaskProgress(id: string, status: string, notes?: string, progressPercent?: number) {
    const existing = await prisma.workTask.findUnique({ where: { workTaskId: BigInt(id) } });
    if (!existing) throw new AppError('Không tìm thấy công việc.', 404);

    const updateData: any = { status };
    if (progressPercent !== undefined) updateData.progressPercent = progressPercent;

    if (status !== 'in_progress' && status !== 'done' && status !== 'assigned') {
      throw new AppError('Cập nhật trạng thái không hợp lệ.', 400, 'MSG-UC25-01');
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
    if (!existingTask) throw new AppError('Không tìm thấy công việc.', 404);

    const existingReport = await prisma.surveyReport.findFirst({
      where: { workTaskId: BigInt(id) }
    });

    if (existingReport) {
      throw new AppError('Báo cáo khảo sát đã được nộp.', 400, 'MSG-UC12-01');
    }

    if (!evidences || !Array.isArray(evidences) || evidences.length === 0) {
      throw new AppError('Phải bao gồm ít nhất một ảnh bằng chứng.', 400);
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
    if (!task) throw new AppError('Không tìm thấy công việc.', 404);

    const report = await prisma.surveyReport.findFirst({
      where: { workTaskId: BigInt(id) }
    });

    if (!report) throw new AppError('Không tìm thấy báo cáo khảo sát.', 404);

    const evidences = await prisma.evidence.findMany({
      where: { refType: 'SurveyReport', refId: report.surveyReportId }
    });

    const user = await prisma.internalUser.findUnique({
      where: { userId: report.recordedBy }
    });

    return {
      workTaskId: task.workTaskId.toString(),
      notes: report.siteCondition,
      evidences,
      surveyedBy: {
        userId: report.recordedBy.toString(),
        fullName: user?.fullName || 'Unknown'
      },
      submittedAt: report.createdAt,
    };
  }

  public async viewPickList(id: string) {
    const task = await prisma.workTask.findUnique({
      where: { workTaskId: BigInt(id) }
    });
    if (!task) throw new AppError('Không tìm thấy công việc.', 404);
    
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

    if (!report) throw new AppError('Không tìm thấy báo cáo khảo sát.', 404);
    if (report.status === 'approved') throw new AppError('Báo cáo đã được phê duyệt.', 400);

    await prisma.surveyReport.update({
      where: { surveyReportId: report.surveyReportId },
      data: {
        status: status,
      }
    });
  }
}

export const taskService = new TaskService();
