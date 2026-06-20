import prisma from '../config/database';

export class ReportService {
  static async getAdminDashboard() {
    const totalOrders = await prisma.order.count();
    const totalCustomers = await prisma.customer.count();
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    });

    return {
      total_revenue: payments._sum.amount ? Number(payments._sum.amount) : 0,
      total_orders: totalOrders,
      total_customers: totalCustomers,
      recent_orders: await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, eventDate: true }
      }).then(res => res.map(o => ({ ...o, id: Number(o.id) })))
    };
  }

  static async getOperationsDashboard() {
    const pendingAssignments = await prisma.assignment.count({
      where: { status: { not: 'completed' } }
    });
    
    // Check low stock (less than 10)
    const lowStockItems = await prisma.inventory.count({
      where: { quantityAvailable: { lt: 10 } }
    });

    return {
      pending_assignments: pendingAssignments,
      low_stock_items: lowStockItems
    };
  }

  static async getRevenueReport(startDate?: string, endDate?: string, period: string = 'monthly') {
    // Basic implementation: just get completed payments and group by month in JS (since Prisma groupBy date is complex)
    const whereClause: any = { status: 'completed' };
    if (startDate || endDate) {
      whereClause.paymentDate = {};
      if (startDate) whereClause.paymentDate.gte = new Date(startDate);
      if (endDate) whereClause.paymentDate.lte = new Date(endDate);
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      select: { amount: true, paymentDate: true }
    });

    let total = 0;
    const byMonth: Record<string, number> = {};
    for (const p of payments) {
      const amt = Number(p.amount);
      total += amt;
      const month = p.paymentDate.toISOString().slice(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + amt;
    }

    return {
      total_revenue: total,
      breakdown: Object.entries(byMonth).map(([month, amount]) => ({ period: month, amount }))
    };
  }

  static async getOrdersReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true }
    });

    return {
      by_status: orders.map(o => ({ status: o.status, count: o._count.id }))
    };
  }

  static async getInventoryReport() {
    // Sum of inventory quantities
    const inv = await prisma.inventory.aggregate({
      _sum: { quantityAvailable: true, quantityReserved: true }
    });
    
    return {
      total_available: Number(inv._sum.quantityAvailable || 0),
      total_reserved: Number(inv._sum.quantityReserved || 0)
    };
  }

  static async getStaffReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.periodStart = {};
      if (startDate) whereClause.periodStart.gte = new Date(startDate);
    }

    const wages = await prisma.wageSummary.findMany({
      where: whereClause,
      include: { user: { select: { fullName: true } } }
    });

    return wages.map(w => ({
      staff_id: Number(w.userId),
      name: w.user.fullName,
      total_sessions: Number(w.totalSessions),
      net_wage: Number(w.netWage)
    }));
  }

  static async getWarehouseReturnsReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const items = await prisma.handoverItem.groupBy({
      by: ['itemStatus'],
      where: whereClause,
      _sum: { quantityExpected: true, quantityActual: true }
    });

    return items.map(i => ({
      condition: i.itemStatus,
      total_quantity_expected: Number(i._sum.quantityExpected || 0),
      total_quantity_actual: Number(i._sum.quantityActual || 0)
    }));
  }

  static async getSupplierDebtReport() {
    const debts = await prisma.supplierPayable.groupBy({
      by: ['supplierId'],
      where: { status: 'pending' },
      _sum: { totalAmount: true }
    });

    return debts.map(d => ({
      supplier_id: Number(d.supplierId),
      total_debt: Number(d._sum.totalAmount || 0)
    }));
  }

  static async getWagesReport(startDate?: string, endDate?: string) {
    const whereClause: any = {};
    if (startDate || endDate) {
      whereClause.periodStart = {};
      if (startDate) whereClause.periodStart.gte = new Date(startDate);
    }

    const wages = await prisma.wageSummary.aggregate({
      _sum: { netWage: true },
      where: whereClause
    });

    return {
      total_wage_fund: Number(wages._sum.netWage || 0)
    };
  }
}