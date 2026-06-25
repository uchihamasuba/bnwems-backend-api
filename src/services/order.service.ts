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

    if (!order) throw new AppError('Order not found', 404);
    
    // Manual join to avoid relation naming issues if not mapped properly in schema
    const customer = await prisma.customer.findUnique({ where: { customerId: order.customerId } });
    
    return { ...order, customer };
  }

  public async createOrder(data: any, actionUserId: string) {
    const { customerId, eventStartDate, venueAddress } = data;

    if (new Date(eventStartDate) <= new Date()) {
      throw new AppError('Event date must be in the future.', 400, 'MSG-UC11-01');
    }

    const newOrder = await prisma.order.create({
      data: {
        customerId: BigInt(customerId),
        eventDate: new Date(eventStartDate),
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
    if (!order) throw new AppError('Order not found', 404);

    const quote = await prisma.quotation.findUnique({
      where: { orderId: BigInt(id) }
    });

    if (!quote || quote.status !== 'confirmed') {
      throw new AppError('Cannot confirm order without an accepted quotation.', 400, 'MSG-UC11-04');
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
}

export const orderService = new OrderService();
