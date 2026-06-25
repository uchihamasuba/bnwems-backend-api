import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class InventoryService {
  public async getInventory(warehouseId?: string, catalogItemId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (warehouseId) whereClause.warehouseId = BigInt(warehouseId);
    if (catalogItemId) whereClause.catalogItemId = BigInt(catalogItemId);

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
      warehouseId: inv.warehouseId,
      catalogItemId: inv.catalogItemId,
      availableQuantity: inv.availableQuantity,
      reservedQuantity: 0, // In new schema, this requires aggregation from InventoryReservation
      checkedOutQuantity: inv.totalQuantity - inv.availableQuantity,
      damagedQuantity: 0,
      lostQuantity: 0
    }));

    return { inventory: data, totalCount };
  }

  public async checkAvailability(eventDate: string, itemId: string) {
    const inventories = await prisma.inventory.findMany({
      where: { catalogItemId: BigInt(itemId) },
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
        catalogItemId: BigInt(itemId),
        reservationId: { in: reservationIds }
      }
    });
    
    const totalReserved = reservations.reduce((sum, r) => sum + r.reservedQuantity, 0);
    const availableOnDate = totalAvailable - totalReserved;

    return {
      catalogItemId: itemId,
      isAvailable: availableOnDate > 0,
      availableQuantityOnDate: availableOnDate > 0 ? availableOnDate : 0,
    };
  }

  public async reserveInventory(orderId: string, items: any[], eventDate: string, actionUserId: string) {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { catalogItemId: BigInt(item.catalogItemId) },
      });
      if (!inv) {
        throw new AppError('Item not found in inventory', 404);
      }
      
      const availability = await this.checkAvailability(eventDate, item.catalogItemId);
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
            catalogItemId: BigInt(item.catalogItemId),
            reservedQuantity: item.quantity
          }
        });
      }
    });
  }
}

export const inventoryService = new InventoryService();
