import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class ReportService {
  public async getRevenueReport(startDate: string, endDate: string) {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        paymentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRevenue,
      breakdownByMonth: [], // Mocked
      topCustomers: [], // Mocked
    };
  }

  public async getInventoryReport(startDate?: string, endDate?: string) {
    const inventories = await prisma.inventory.findMany({
      include: { catalogItem: true },
    });

    const totalDamaged = inventories.reduce((sum, inv) => sum + inv.damagedQuantity, 0);
    const totalLost = inventories.reduce((sum, inv) => sum + inv.lostQuantity, 0);

    return {
      totalDamaged,
      totalLost,
      mostUsedItems: [], // Mocked
    };
  }

  public async getAdminDashboard() {
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

    return {
      activeOrders: activeOrdersCount,
      totalRevenueMonth: 0, // Mocked
      unpaidSupplierDebt,
      recentOrders: recentOrders.map(o => ({ orderId: o.id, status: o.status })),
    };
  }

  public async getManagerDashboard() {
    const ordersInProgress = await prisma.order.count({
      where: { status: 'IN_PROGRESS' },
    });

    const pendingChangeRequests = await prisma.changeRequest.count({
      where: { status: 'PENDING' },
    });

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

    return {
      ordersInProgress,
      pendingChangeRequests,
      tasksToday,
      alerts: [], // Mocked
    };
  }

  public async getVerificationReport(orderId: string) {
    const tasks = await prisma.workTask.findMany({ where: { orderId } });
    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter(t => t.status === 'COMPLETED').length;

    if (totalTasks > 0 && tasksCompleted < totalTasks) {
      throw new AppError('Order results are incomplete for verification.', 400, 'MSG-UC15-01');
    }

    const handover = await prisma.handoverRecord.findUnique({ where: { orderId } });
    const damageLoss = await prisma.damageLossReport.findFirst({ where: { orderId } });
    
    return {
      orderId,
      tasksCompleted,
      totalTasks,
      handoverStatus: handover ? 'AGREED' : 'PENDING',
      damageLossRecorded: !!damageLoss,
      changeRequestsProcessed: true, // Mocked
      verificationStatus: 'READY_FOR_SETTLEMENT',
    };
  }
}

export const reportService = new ReportService();
