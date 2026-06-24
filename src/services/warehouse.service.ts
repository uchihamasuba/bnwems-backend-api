import { prisma } from '../config/database';

class WarehouseService {
  public async getWarehouseHistories(page: number, limit: number, transactionType?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (transactionType) whereClause.transactionType = transactionType;

    const [histories, totalCount] = await Promise.all([
      prisma.warehouseHistory.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.warehouseHistory.count({ where: whereClause }),
    ]);

    return { histories, totalCount };
  }

  public async checkoutWarehouse(warehouseId: string, orderId: string, items: any[], actionUserId: string) {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { warehouseId, catalogItemId: item.catalogItemId },
      });
      if (!inv) continue;

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: Math.max(0, inv.reservedQuantity - item.quantity),
          checkedOutQuantity: inv.checkedOutQuantity + item.quantity,
        },
      });
    }

    await prisma.warehouseHistory.create({
      data: {
        warehouseId,
        transactionType: 'CHECKOUT' as any,
        details: items as any,
        performedBy: actionUserId,
      },
    });
  }

  public async returnWarehouse(warehouseId: string, orderId: string, items: any[], actionUserId: string) {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { warehouseId, catalogItemId: item.catalogItemId },
      });
      if (!inv) continue;

      const isDamaged = item.condition === 'DAMAGED';
      const dq = isDamaged ? inv.damagedQuantity + item.quantity : inv.damagedQuantity;

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          checkedOutQuantity: Math.max(0, inv.checkedOutQuantity - item.quantity),
          damagedQuantity: dq,
        },
      });
    }

    await prisma.warehouseHistory.create({
      data: {
        warehouseId,
        transactionType: 'RETURN' as any,
        details: items as any,
        performedBy: actionUserId,
      },
    });
  }
}

export const warehouseService = new WarehouseService();
