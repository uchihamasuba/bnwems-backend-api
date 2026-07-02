import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class OrderService {
  public async getOrders(page: number, limit: number, search?: string, status?: string, startDate?: string, endDate?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) whereClause.orderNumber = { contains: search };
    if (status) whereClause.status = status;
    if (startDate || endDate) {
      whereClause.eventDate = {};
      if (startDate) whereClause.eventDate.gte = new Date(startDate);
      if (endDate) whereClause.eventDate.lte = new Date(endDate);
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return { orders, totalCount };
  }

  public async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(id) },
    });

    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);
    
    // Manual join to avoid relation naming issues if not mapped properly in schema
    const customer = await prisma.customer.findUnique({ where: { customerId: order.customerId } });
    
    return { ...order, customer };
  }

  public async createOrder(data: any, actionUserId: string) {
    const { customerId, eventStartDate, eventEndDate, eventType, guestCount, venueAddress } = data;

    if (new Date(eventStartDate) <= new Date()) {
      throw new AppError('Ngày sự kiện phải ở trong tương lai.', 400, 'MSG-UC11-01');
    }

    const newOrder = await prisma.order.create({
      data: {
        customerId: BigInt(customerId),
        eventDate: new Date(eventStartDate),
        eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
        eventType: eventType || null,
        guestCount: guestCount || null,
        eventLocation: venueAddress,
        status: 'draft',
        createdBy: BigInt(actionUserId)
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_ORDER',
        entityType: 'Order',
        entityId: newOrder.orderId,
      },
    });

    return { id: newOrder.orderId };
  }

  public async confirmOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(id) },
    });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    const quote = await prisma.quotation.findFirst({
      where: { orderId: BigInt(id) },
      orderBy: { version: 'desc' }
    });

    if (!quote || quote.status !== 'confirmed') {
      throw new AppError('Không thể xác nhận đơn hàng khi chưa có báo giá được chấp nhận.', 400, 'MSG-UC11-04');
    }

    await prisma.order.update({
      where: { orderId: BigInt(id) },
      data: { status: 'confirmed' },
    });
  }

  public async changeEventDate(id: string, newEventDate: string) {
    await prisma.order.update({
      where: { orderId: BigInt(id) },
      data: { eventDate: new Date(newEventDate) },
    });
  }

  public async closeOrder(id: string) {
    await prisma.order.update({
      where: { orderId: BigInt(id) },
      data: { status: 'completed' },
    });
  }

  public async getFieldProgress() {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['confirmed', 'in_progress'] } },
    });
    
    // Map order progress manually as relations might be named differently
    const data = await Promise.all(orders.map(async (o) => {
      const task = await prisma.workTask.findFirst({
        where: { orderId: o.orderId },
        orderBy: { updatedAt: 'desc' }
      });
      return {
        orderId: o.orderId,
        currentTask: task ? task.taskCategory : null,
        status: task ? task.status : null,
        lastUpdate: task ? task.updatedAt : null,
      };
    }));

    return data;
  }

  public async getOrderEvidences(id: string) {
    const evidences = await prisma.evidence.findMany({
      where: { orderId: BigInt(id) },
      orderBy: { uploadedAt: 'desc' },
    });
    return evidences;
  }

  public async getMobileSummary(id: string) {
    const order = await prisma.order.findUnique({
      where: { orderId: BigInt(id) },
    });
    if (!order) throw new AppError('Không tìm thấy đơn hàng.', 404);

    const customer = await prisma.customer.findUnique({
      where: { customerId: order.customerId },
    });

    const tasks = await prisma.workTask.findMany({
      where: { orderId: BigInt(id) },
    });

    const payments = await prisma.payment.findMany({
      where: { orderId: BigInt(id) },
    });

    const changeRequests = await prisma.changeRequest.findMany({
      where: { orderId: BigInt(id) },
    });

    const handovers = await prisma.handoverRecord.findMany({
      where: { orderId: BigInt(id) },
    });

    return {
      order: {
        ...order,
        orderId: order.orderId.toString(),
        customerId: order.customerId.toString(),
        createdBy: order.createdBy?.toString(),
      },
      customer: {
        ...customer,
        customerId: customer?.customerId.toString(),
      },
      tasks: tasks.map(t => ({
        ...t,
        workTaskId: t.workTaskId.toString(),
        orderId: t.orderId.toString(),
        createdBy: t.createdBy?.toString(),
      })),
      payments: payments.map(p => ({
        ...p,
        paymentId: p.paymentId.toString(),
        orderId: p.orderId.toString(),
        paymentRequestId: p.paymentRequestId?.toString(),
        confirmedBy: p.confirmedBy?.toString(),
      })),
      changeRequests: changeRequests.map(c => ({
        ...c,
        changeRequestId: c.changeRequestId.toString(),
        orderId: c.orderId.toString(),
        requestedBy: c.requestedBy.toString(),
        approvedBy: c.approvedBy?.toString(),
        reconciledBy: c.reconciledBy?.toString(),
      })),
      handovers: handovers.map(h => ({
        ...h,
        handoverId: h.handoverId.toString(),
        orderId: h.orderId.toString(),
        recordedBy: h.recordedBy.toString(),
      })),
    };
  }

  public async getWorkflowTimeline(id: string) {
    const orderId = BigInt(id);

    const auditLogs = await prisma.auditLog.findMany({
      where: { entityType: 'Order', entityId: orderId },
      orderBy: { createdAt: 'asc' },
    });

    const tasks = await prisma.workTask.findMany({
      where: { orderId },
      orderBy: { updatedAt: 'asc' },
    });

    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { paidAt: 'asc' },
    });

    const changeRequests = await prisma.changeRequest.findMany({
      where: { orderId },
      orderBy: { updatedAt: 'asc' },
    });

    const timeline: any[] = [];

    auditLogs.forEach(log => {
      timeline.push({
        type: 'AUDIT',
        title: log.action,
        timestamp: log.createdAt,
        user: log.userId?.toString(),
      });
    });

    tasks.forEach(task => {
      timeline.push({
        type: 'TASK',
        title: `Task ${task.taskCategory} - ${task.status}`,
        timestamp: task.updatedAt,
        details: task.workTaskId.toString(),
      });
    });

    payments.forEach(payment => {
      timeline.push({
        type: 'PAYMENT',
        title: `Payment ${payment.status}`,
        timestamp: payment.paidAt,
        amount: payment.amount,
      });
    });

    changeRequests.forEach(cr => {
      timeline.push({
        type: 'CHANGE_REQUEST',
        title: `Change Request - ${cr.status}`,
        timestamp: cr.updatedAt,
        details: cr.type,
      });
    });

    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return timeline;
  }
}

export const orderService = new OrderService();
