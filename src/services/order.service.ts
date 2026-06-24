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
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  public async createOrder(data: any, actionUserId: string) {
    const { customerId, eventDate, venueAddress } = data;

    if (new Date(eventDate) <= new Date()) {
      throw new AppError('Event date must be in the future.', 400, 'MSG-UC11-01');
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        eventDate: new Date(eventDate),
        venueAddress,
        status: 'DRAFT',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'CREATE_ORDER',
        entityType: 'Order',
        entityId: newOrder.id,
      },
    });

    return { id: newOrder.id, orderNumber };
  }

  public async confirmOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { quotations: true },
    });

    if (!order) throw new AppError('Order not found', 404);

    const hasAcceptedQuote = order.quotations.some(q => q.status === 'ACCEPTED');
    if (!hasAcceptedQuote) {
      throw new AppError('Cannot confirm order without an accepted quotation.', 400, 'MSG-UC11-04');
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  }

  public async changeEventDate(id: string, newEventDate: string) {
    await prisma.order.update({
      where: { id },
      data: { eventDate: new Date(newEventDate) },
    });
  }

  public async closeOrder(id: string) {
    await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  public async getFieldProgress() {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['CONFIRMED', 'IN_PROGRESS'] } as any },
      include: {
        workTasks: {
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
      },
    });

    const data = orders.map(o => ({
      orderId: o.id,
      currentTask: o.workTasks.length > 0 ? o.workTasks[0].taskType : null,
      status: o.workTasks.length > 0 ? o.workTasks[0].status : null,
      lastUpdate: o.workTasks.length > 0 ? o.workTasks[0].updatedAt : null,
    }));

    return data;
  }
}

export const orderService = new OrderService();
