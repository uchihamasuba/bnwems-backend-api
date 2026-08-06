import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { ScheduleStatus, SurveyStatus, ReportType, ReportStatus } from '@prisma/client';

class OperationsService {
  // ============================================================================
  // WORK TASKS
  // ============================================================================

  public async getWorkTasks(isActive?: boolean) {
    const whereClause: any = {};
    if (isActive !== undefined) {
      whereClause.isActive = isActive;
    }
    return await prisma.workTask.findMany({
      where: whereClause,
      orderBy: { taskId: 'asc' },
    });
  }

  // ============================================================================
  // SCHEDULE PLANS
  // ============================================================================

  public async getSchedulePlans(
    page: number,
    limit: number,
    orderId?: string,
    assignedTo?: string,
    status?: ScheduleStatus,
    date?: string,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (orderId) whereClause.orderId = BigInt(orderId);
    if (assignedTo) whereClause.assignedTo = BigInt(assignedTo);
    if (status) whereClause.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      whereClause.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [plans, totalCount] = await Promise.all([
      prisma.schedulePlan.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          task: { select: { taskName: true } },
          assignee: { select: { fullName: true } },
        },
      }),
      prisma.schedulePlan.count({ where: whereClause }),
    ]);

    const formattedPlans = plans.map((p) => ({
      ...p,
      taskName: p.task?.taskName,
      assigneeName: p.assignee?.fullName,
    }));

    return { plans: formattedPlans, totalCount };
  }

  public async createSchedulePlan(data: any, actionUserId: string) {
    const { orderId, taskId, assignedTo, startTime, endTime, location, notes } = data;

    const planCode = 'PLN-' + Date.now();

    return await prisma.schedulePlan.create({
      data: {
        planCode,
        orderId: BigInt(orderId),
        taskId: BigInt(taskId),
        assignedTo: BigInt(assignedTo),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location,
        notes,
        status: ScheduleStatus.PENDING,
        createdBy: BigInt(actionUserId),
      },
    });
  }

  public async updateSchedulePlan(id: string, data: any) {
    const plan = await prisma.schedulePlan.findUnique({ where: { planId: BigInt(id) } });
    if (!plan) throw new AppError('Không tìm thấy phân công.', 404);

    if (plan.status === ScheduleStatus.IN_PROGRESS || plan.status === ScheduleStatus.COMPLETED) {
      throw new AppError('Không thể sửa phân công đã bắt đầu hoặc hoàn thành.', 400, 'MSG-UC54-07');
    }

    const updateData: any = {};
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.location) updateData.location = data.location;
    if (data.notes) updateData.notes = data.notes;

    return await prisma.schedulePlan.update({
      where: { planId: BigInt(id) },
      data: updateData,
    });
  }

  public async updateSchedulePlanStatus(
    id: string,
    status: ScheduleStatus,
    notes?: string,
    evidenceId?: number,
  ) {
    const plan = await prisma.schedulePlan.findUnique({ where: { planId: BigInt(id) } });
    if (!plan) throw new AppError('Không tìm thấy phân công.', 404);

    const updateData: any = { status };
    if (notes) updateData.notes = notes;
    if (evidenceId) updateData.evidenceId = BigInt(evidenceId);

    return await prisma.schedulePlan.update({
      where: { planId: BigInt(id) },
      data: updateData,
    });
  }

  // ============================================================================
  // SURVEY REPORTS
  // ============================================================================

  public async getOrderSurveyReports(orderId: string) {
    return await prisma.surveyReport.findMany({
      where: { orderId: BigInt(orderId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getSurveyReportById(id: string) {
    const report = await prisma.surveyReport.findUnique({
      where: { surveyId: BigInt(id) },
      include: {
        evidence: true,
      },
    });
    if (!report) throw new AppError('Không tìm thấy báo cáo khảo sát.', 404);
    return report;
  }

  public async createSurveyReport(data: any, actionUserId: string) {
    const {
      orderId,
      planId,
      evidenceId,
      surveyDate,
      location,
      area,
      length,
      width,
      entrance,
      siteConstraints,
      additionalRequests,
      proposedItems,
      notes,
    } = data;

    const reportCode = 'SRV-' + Date.now();

    return await prisma.surveyReport.create({
      data: {
        reportCode,
        orderId: BigInt(orderId),
        planId: planId ? BigInt(planId) : null,
        evidenceId: evidenceId ? BigInt(evidenceId) : null,
        surveyDate: new Date(surveyDate),
        location,
        area,
        length,
        width,
        entrance,
        siteConstraints,
        additionalRequests,
        proposedItems,
        notes,
        status: SurveyStatus.DRAFT,
        reportedBy: BigInt(actionUserId),
      },
    });
  }

  public async confirmSurveyReport(id: string, status: SurveyStatus, actionUserId: string) {
    const report = await prisma.surveyReport.findUnique({ where: { surveyId: BigInt(id) } });
    if (!report) throw new AppError('Không tìm thấy báo cáo khảo sát.', 404);

    return await prisma.surveyReport.update({
      where: { surveyId: BigInt(id) },
      data: {
        status,
        confirmedBy: BigInt(actionUserId),
        confirmedAt: new Date(),
      },
    });
  }

  // ============================================================================
  // MOBILE FIELD OPS (COLLECTED EQUIPMENT REPORT)
  // ============================================================================

  public async getOrderItemsForPickList(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(orderId) },
      include: {
        orderItems: {
          include: { item: { select: { itemName: true } } },
        },
      },
    });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    const items = order.orderItems.map((i) => ({
      itemId: i.itemId,
      itemName: i.item.itemName,
      quantity: i.quantity,
      preparedQty: i.preparedQty,
      source: i.source,
    }));

    return {
      orderId: order.orderId,
      orderCode: order.orderCode,
      eventName: order.eventName,
      location: order.location,
      items,
    };
  }

  public async createCollectedEquipmentReport(orderId: string, data: any, actionUserId: string) {
    const { reportType, notes, items } = data;

    const reportItems = items.map((i: any) => ({
      itemId: BigInt(i.itemId),
      goodQuantity: i.goodQuantity,
      damagedQuantity: i.damagedQuantity,
      lostQuantity: i.lostQuantity,
      notes: i.notes,
    }));

    return await prisma.collectedEquipmentReport.create({
      data: {
        orderId: BigInt(orderId),
        reportType,
        status: ReportStatus.SUBMITTED,
        notes,
        reportedBy: BigInt(actionUserId),
        items: {
          create: reportItems,
        },
      },
    });
  }
}

export const operationsService = new OperationsService();
