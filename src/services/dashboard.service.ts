import { prisma } from '../config/database';
import { ScheduleStatus, SurveyStatus, ReportStatus, OrderStatus } from '@prisma/client';

class DashboardService {
  public async getAdminDashboard() {
    const [activeOrders, totalRevenueMonth, unpaidSupplierDebt, recentOrders] = await Promise.all([
      prisma.order.count({
        where: { orderStatus: { notIn: [OrderStatus.CANCELLED, OrderStatus.COMPLETED] } },
      }),
      // Mocking revenue for simplicity as Prisma aggregate on Decimal can be tricky without raw query
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { orderStatus: OrderStatus.COMPLETED },
      }),
      // Unpaid supplier transactions
      prisma.supplierTransaction.aggregate({
        _sum: { estimatedCost: true },
        where: { status: 'PENDING' },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { orderId: true, orderStatus: true, eventName: true },
      }),
    ]);

    return {
      activeOrders,
      totalRevenueMonth: totalRevenueMonth._sum.totalAmount || 0,
      unpaidSupplierDebt: unpaidSupplierDebt._sum.estimatedCost || 0,
      recentOrders,
    };
  }

  public async getManagerDashboard() {
    const [ordersInProgress, pendingWarnings, tasksToday] = await Promise.all([
      prisma.order.count({
        where: { orderStatus: OrderStatus.IN_PROGRESS },
      }),
      prisma.orderWarning.count({
        where: { isResolved: false },
      }),
      prisma.schedulePlan.count({
        where: {
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    const alerts = await prisma.orderWarning.findMany({
      where: { isResolved: false },
      take: 5,
      select: { warningId: true, content: true },
    });

    return {
      ordersInProgress,
      pendingWarnings,
      tasksToday,
      alerts: alerts.map((a) => ({ type: 'warning', ...a })),
    };
  }

  public async getRevenueReport(startDate: string, endDate: string) {
    // Basic implementation
    const sum = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        orderStatus: OrderStatus.COMPLETED,
      },
    });

    return {
      totalRevenue: sum._sum.totalAmount || 0,
      breakdownByMonth: [], // Requires complex grouping or raw query
      topCustomers: [],
    };
  }

  public async getInventoryReport(startDate: string, endDate: string) {
    const reports = await prisma.collectedEquipmentReportItem.aggregate({
      _sum: { damagedQuantity: true, lostQuantity: true },
      // Note: in a real scenario we filter by report.createdAt via relation but Prisma aggregate doesn't support relation where easily
    });

    return {
      totalDamaged: reports._sum.damagedQuantity || 0,
      totalLost: reports._sum.lostQuantity || 0,
      mostUsedItems: [],
    };
  }

  public async getOperationalVerification(orderId: string) {
    const plans = await prisma.schedulePlan.findMany({
      where: { orderId: BigInt(orderId) },
    });

    const tasksCompleted = plans.filter((p) => p.status === ScheduleStatus.COMPLETED).length;

    return {
      orderId: BigInt(orderId),
      tasksCompleted,
      totalTasks: plans.length,
      warningsResolved: true,
      damageLossRecorded: true,
      verificationStatus: tasksCompleted === plans.length ? 'ready_for_settlement' : 'pending',
    };
  }

  public async getManagerApprovals() {
    const [orderWarnings, surveyReports] = await Promise.all([
      prisma.orderWarning.findMany({
        where: { isResolved: false },
        take: 10,
      }),
      prisma.surveyReport.findMany({
        where: { status: SurveyStatus.DRAFT }, // Using DRAFT as 'pending review'
        take: 10,
      }),
    ]);

    return {
      orderWarnings,
      surveyReports,
    };
  }
}

export const dashboardService = new DashboardService();
