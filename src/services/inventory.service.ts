import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class InventoryService {
  public async getInventory(equipmentItemId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (equipmentItemId) whereClause.equipmentItemId = BigInt(equipmentItemId);

    const [inventory, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: limit,
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    // Map to API contract
    const data = inventory.map(inv => ({
      inventoryId: inv.inventoryId,
      equipmentItemId: inv.equipmentItemId,
      totalQuantity: inv.totalQuantity,
      availableQuantity: inv.availableQuantity,
      reservedQuantity: inv.reservedQuantity, 
      checkedOutQuantity: inv.totalQuantity - inv.availableQuantity - inv.reservedQuantity,
      damagedQuantity: inv.damagedQuantity,
      lostQuantity: 0
    }));

    return { inventory: data, totalCount };
  }

  public async createInventory(data: any) {
    const equipmentItemId = BigInt(data.equipmentItemId);
    
    const eq = await prisma.equipment.findUnique({ where: { equipmentItemId } });
    if (!eq) {
      throw new AppError('Equipment not found', 404);
    }

    const newInventory = await prisma.inventory.create({
      data: {
        equipmentItemId,
        totalQuantity: data.availableQuantity,
        availableQuantity: data.availableQuantity,
        reservedQuantity: 0,
        damagedQuantity: 0,
      },
    });

    return newInventory;
  }

  public async updateInventory(id: string, data: any) {
    const inventoryId = BigInt(id);

    const existing = await prisma.inventory.findUnique({
      where: { inventoryId },
    });
    if (!existing) {
      throw new AppError('Inventory not found', 404);
    }

    const availableQuantity = data.availableQuantity ?? existing.availableQuantity;
    const reservedQuantity = data.reservedQuantity ?? existing.reservedQuantity;
    const damagedQuantity = data.damagedQuantity ?? existing.damagedQuantity;
    const totalQuantity = availableQuantity + reservedQuantity + damagedQuantity;

    const updated = await prisma.inventory.update({
      where: { inventoryId },
      data: {
        totalQuantity,
        availableQuantity,
        reservedQuantity,
        damagedQuantity,
      },
    });

    return updated;
  }

  public async checkAvailability(eventDate: string, itemId: string) {
    const inventories = await prisma.inventory.findMany({
      where: { equipmentItemId: BigInt(itemId) },
    });

    let totalAvailable = 0;
    for (const inv of inventories) {
      totalAvailable += inv.availableQuantity;
    }
    
    // In a real scenario, we'd subtract any active reservations for eventDate from totalAvailable
    const activeReservations = await prisma.inventoryReservation.findMany({
      where: {
        eventDate: new Date(eventDate),
        status: 'reserved'
      }
    });

    const reservationIds = activeReservations.map(r => r.reservationId);

    const reservations = await prisma.inventoryReservationItem.findMany({
      where: {
        equipmentItemId: BigInt(itemId),
        reservationId: { in: reservationIds }
      }
    });
    
    const totalReserved = reservations.reduce((sum, r) => sum + r.reservedQuantity, 0);
    const availableOnDate = totalAvailable - totalReserved;

    return {
      equipmentItemId: itemId,
      isAvailable: availableOnDate > 0,
      availableQuantityOnDate: availableOnDate > 0 ? availableOnDate : 0,
    };
  }

  public async reserveInventory(orderId: string, items: any[], eventDate: string, actionUserId: string) {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { equipmentItemId: BigInt(item.equipmentItemId) },
      });
      if (!inv) {
        throw new AppError('Item not found in inventory', 404);
      }
      
      const availability = await this.checkAvailability(eventDate, item.equipmentItemId);
      if (item.quantity > availability.availableQuantityOnDate) {
        throw new AppError('Insufficient inventory available for the requested date.', 400, 'MSG-UC13-04');
      }
    }

    // New schema uses InventoryReservation instead of updating Inventory.reservedQuantity
    await prisma.$transaction(async (prismaTx) => {
      const reservation = await prismaTx.inventoryReservation.create({
        data: {
          orderId: BigInt(orderId),
          eventDate: new Date(eventDate),
          status: 'reserved',
          createdBy: BigInt(actionUserId)
        }
      });

      for (const item of items) {
        await prismaTx.inventoryReservationItem.create({
          data: {
            reservationId: reservation.reservationId,
            equipmentItemId: BigInt(item.equipmentItemId),
            reservedQuantity: item.quantity
          }
        });
      }
    });
  }
  public async getInventoryReports(reportType?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (reportType) whereClause.reportType = reportType;

    const [reports, totalCount] = await Promise.all([
      prisma.inventoryReport.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventoryReport.count({ where: whereClause })
    ]);
    
    return {
      reports: reports.map(r => ({
        ...r,
        inventoryReportId: r.inventoryReportId.toString(),
        orderId: r.orderId.toString(),
        recordedBy: r.recordedBy.toString(),
        confirmedBy: r.confirmedBy?.toString()
      })),
      totalCount
    };
  }

  public async checkoutInventory(data: any, actionUserId: string) {
    const { orderId, items } = data;
    
    await prisma.$transaction(async (prismaTx) => {
      const report = await prismaTx.inventoryReport.create({
        data: {
          orderId: BigInt(orderId),
          reportType: 'checkout',
          recordedBy: BigInt(actionUserId),
        }
      });

      for (const item of items) {
        await prismaTx.inventoryReportItem.create({
          data: {
            inventoryReportId: report.inventoryReportId,
            equipmentItemId: BigInt(item.equipmentItemId),
            quantity: item.quantity,
          }
        });

        // Checkout decreases reservedQuantity
        const inv = await prismaTx.inventory.findUnique({ where: { equipmentItemId: BigInt(item.equipmentItemId) } });
        if (inv) {
          await prismaTx.inventory.update({
            where: { equipmentItemId: BigInt(item.equipmentItemId) },
            data: {
              reservedQuantity: Math.max(0, inv.reservedQuantity - item.quantity)
            }
          });
        }
      }
    });
  }

  public async returnInventory(data: any, actionUserId: string) {
    const { orderId, items } = data;
    
    await prisma.$transaction(async (prismaTx) => {
      const report = await prismaTx.inventoryReport.create({
        data: {
          orderId: BigInt(orderId),
          reportType: 'return',
          recordedBy: BigInt(actionUserId),
        }
      });

      for (const item of items) {
        await prismaTx.inventoryReportItem.create({
          data: {
            inventoryReportId: report.inventoryReportId,
            equipmentItemId: BigInt(item.equipmentItemId),
            quantity: item.quantity,
            conditionStatus: item.condition || 'good'
          }
        });

        const inv = await prismaTx.inventory.findUnique({ where: { equipmentItemId: BigInt(item.equipmentItemId) } });
        if (inv) {
          if (item.condition === 'damaged' || item.condition === 'lost') {
            await prismaTx.inventory.update({
              where: { equipmentItemId: BigInt(item.equipmentItemId) },
              data: {
                damagedQuantity: inv.damagedQuantity + item.quantity
              }
            });
          } else {
            await prismaTx.inventory.update({
              where: { equipmentItemId: BigInt(item.equipmentItemId) },
              data: {
                availableQuantity: inv.availableQuantity + item.quantity
              }
            });
          }
        }
      }
    });
  }
}

export const inventoryService = new InventoryService();
