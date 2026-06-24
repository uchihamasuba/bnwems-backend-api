import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

// Order Lifecycle (UC 2.11)
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as any;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

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

    res.status(200).json({
      success: true,
      data: orders,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!order) return next(new AppError('Order not found', 404));

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, eventDate, venueAddress } = req.body;

    if (!customerId || !eventDate) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC11-01'));
    }

    if (new Date(eventDate) <= new Date()) {
      return next(new AppError('Event date must be in the future.', 400, 'MSG-UC11-01'));
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
        userId: req.user!.userId,
        action: 'CREATE_ORDER',
        entityType: 'Order',
        entityId: newOrder.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: { id: newOrder.id, orderNumber },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { quotations: true },
    });

    if (!order) return next(new AppError('Order not found', 404));

    const hasAcceptedQuote = order.quotations.some(q => q.status === 'ACCEPTED');
    if (!hasAcceptedQuote) {
      return next(new AppError('Cannot confirm order without an accepted quotation.', 400, 'MSG-UC11-04'));
    }

    await prisma.order.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    res.status(200).json({
      success: true,
      message: 'Order confirmed.',
      data: { status: 'CONFIRMED' },
    });
  } catch (error) {
    next(error);
  }
};

export const changeEventDate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newEventDate } = req.body;

    await prisma.order.update({
      where: { id },
      data: { eventDate: new Date(newEventDate) },
    });

    res.status(200).json({
      success: true,
      message: 'Order date updated.',
    });
  } catch (error) {
    next(error);
  }
};

export const closeOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // In reality, check if all payments/settlements/warehouse returns are complete.

    await prisma.order.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    res.status(200).json({
      success: true,
      message: 'Order closed successfully.',
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    next(error);
  }
};

export const getFieldProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
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

    res.status(200).json({
      success: true,
      data,
      meta: { totalCount: data.length },
    });
  } catch (error) {
    next(error);
  }
};
