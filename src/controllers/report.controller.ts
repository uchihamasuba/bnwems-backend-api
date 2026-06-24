import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return next(new AppError('Invalid date range for reports.', 400, 'MSG-UC07-01'));
    }

    // Simplified aggregation for revenue (based on COMPLETED payments or settled orders)
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        paymentDate: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        breakdownByMonth: [], // Mocked
        topCustomers: [], // Mocked
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const inventories = await prisma.inventory.findMany({
      include: { catalogItem: true },
    });

    const totalDamaged = inventories.reduce((sum, inv) => sum + inv.damagedQuantity, 0);
    const totalLost = inventories.reduce((sum, inv) => sum + inv.lostQuantity, 0);

    res.status(200).json({
      success: true,
      data: {
        totalDamaged,
        totalLost,
        mostUsedItems: [], // Mocked
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOrdersCount = await prisma.order.count({
      where: { status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, status: true },
    });

    const debts = await prisma.supplierDebt.findMany({
      where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
    });
    const unpaidSupplierDebt = debts.reduce((sum, d) => sum + (d.amountOwed - d.amountPaid), 0);

    res.status(200).json({
      success: true,
      data: {
        activeOrders: activeOrdersCount,
        totalRevenueMonth: 0, // Mocked
        unpaidSupplierDebt,
        recentOrders: recentOrders.map(o => ({ orderId: o.id, status: o.status })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ordersInProgress = await prisma.order.count({
      where: { status: 'IN_PROGRESS' },
    });

    const pendingChangeRequests = await prisma.changeRequest.count({
      where: { status: 'PENDING' },
    });

    // Today's tasks
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasksToday = await prisma.workTask.count({
      where: {
        scheduledStart: {
          gte: new Date(today.setHours(0,0,0,0)),
          lt: new Date(tomorrow.setHours(0,0,0,0)),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ordersInProgress,
        pendingChangeRequests,
        tasksToday,
        alerts: [], // Mocked
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return next(new AppError('orderId is required', 400));
    }

    const tasks = await prisma.workTask.findMany({ where: { orderId: orderId as string } });
    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter(t => t.status === 'COMPLETED').length;

    if (totalTasks > 0 && tasksCompleted < totalTasks) {
      return next(new AppError('Order results are incomplete for verification.', 400, 'MSG-UC15-01'));
    }

    const handover = await prisma.handoverRecord.findUnique({ where: { orderId: orderId as string } });
    const damageLoss = await prisma.damageLossReport.findFirst({ where: { orderId: orderId as string } });
    
    res.status(200).json({
      success: true,
      data: {
        orderId,
        tasksCompleted,
        totalTasks,
        handoverStatus: handover ? 'AGREED' : 'PENDING',
        damageLossRecorded: !!damageLoss,
        changeRequestsProcessed: true, // Mocked
        verificationStatus: 'READY_FOR_SETTLEMENT',
      },
    });
  } catch (error) {
    next(error);
  }
};
