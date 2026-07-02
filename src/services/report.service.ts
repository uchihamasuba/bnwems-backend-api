import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class ReportService {
  public async getRevenueReport(startDate: string, endDate: string) {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'success',
        paidAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalRevenue,
      breakdownByMonth: [], // Mocked
      topCustomers: [], // Mocked
    };
  }

  public async getInventoryReport(startDate?: string, endDate?: string) {
    const inventories = await prisma.inventory.findMany();

    const totalDamaged = 0; // Requires linking to damage loss reports in real implementation
    const totalLost = 0;

    return {
      totalDamaged,
      totalLost,
      mostUsedItems: [], // Mocked
    };
  }

  public async getAdminDashboard() {
    const activeOrdersCount = await prisma.order.count({
      where: { status: { in: ['confirmed', 'in_progress'] } },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { orderId: true, status: true },
    });

    const debts = await prisma.supplierTransaction.findMany({
      where: { paymentStatus: { in: ['unpaid', 'partial'] } },
    });
    const unpaidSupplierDebt = debts.reduce((sum: number, d: any) => sum + (Number(d.totalCost) - Number(d.paidAmount)), 0);

    return {
      activeOrders: activeOrdersCount,
      totalRevenueMonth: 0, // Mocked
      unpaidSupplierDebt: Number(unpaidSupplierDebt),
      recentOrders: recentOrders.map(o => ({ orderId: o.orderId, status: o.status })),
    };
  }

  public async getManagerDashboard() {
    const ordersInProgress = await prisma.order.count({
      where: { status: 'in_progress' },
    });

    const pendingChangeRequests = await prisma.changeRequest.count({
      where: { status: 'pending' },
    });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activitiesToday = await prisma.schedule.findMany({
      where: {
        plannedDate: {
          gte: new Date(today.setHours(0,0,0,0)),
          lt: new Date(tomorrow.setHours(0,0,0,0)),
        },
      },
    });
    
    const activityIds = activitiesToday.map((a: any) => a.scheduleId);

    const tasksToday = await prisma.workTask.count({
      where: {
        scheduleId: { in: activityIds }
      }
    });

    return {
      ordersInProgress,
      pendingChangeRequests,
      tasksToday,
      alerts: [], // Mocked
    };
  }

  public async getVerificationReport(orderId: string) {
    const tasks = await prisma.workTask.findMany({ where: { orderId: BigInt(orderId) } });
    const totalTasks = tasks.length;
    const tasksCompleted = tasks.filter(t => t.status === 'done').length;

    if (totalTasks > 0 && tasksCompleted < totalTasks) {
      throw new AppError('Kết quả đơn hàng chưa hoàn tất để có thể xác minh.', 400, 'MSG-UC15-01');
    }

    const handover = await prisma.handoverRecord.findFirst({ where: { orderId: BigInt(orderId) } });
    const damageLoss = await prisma.damageLossReport.findFirst({ where: { orderId: BigInt(orderId) } });
    
    return {
      orderId,
      tasksCompleted,
      totalTasks,
      handoverStatus: handover ? 'agreed' : 'pending',
      damageLossRecorded: !!damageLoss,
      changeRequestsProcessed: true, // Mocked
      verificationStatus: 'ready_for_settlement',
    };
  }
}

export const reportService = new ReportService();
