import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class InventoryService {
  static async checkAvailability(eventDate: string, itemIds: string[]) {
    const itemIdsBigInt = itemIds.map(id => BigInt(id));
    const targetDate = new Date(eventDate);
    // Remove time portion for date comparison if needed, but DB uses DateTime
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const inventories = await prisma.inventory.findMany({
      where: { catalogItemId: { in: itemIdsBigInt } },
      include: { catalogItem: true }
    });

    const reservations = await prisma.inventoryReservation.findMany({
      where: {
        catalogItemId: { in: itemIdsBigInt },
        eventDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const results = itemIdsBigInt.map(id => {
      const invs = inventories.filter(inv => inv.catalogItemId === id);
      const resvs = reservations.filter(res => res.catalogItemId === id);

      const quantityTotal = invs.reduce((sum, inv) => sum + Number(inv.quantityTotal), 0);
      const reservedOnDate = resvs.reduce((sum, res) => sum + Number(res.quantityReserved), 0);
      const catalogItem = invs.length > 0 ? invs[0].catalogItem : null;

      return {
        catalog_item_id: Number(id),
        name: catalogItem?.name || 'Unknown',
        quantity_total: quantityTotal,
        reserved_on_date: reservedOnDate,
        quantity_available_today: Math.max(0, quantityTotal - reservedOnDate)
      };
    });

    return results;
  }

  static async checkInventory(catalogItemId: string) {
    const items = await prisma.inventory.findMany({
      where: { catalogItemId: BigInt(catalogItemId) },
      include: { warehouse: true }
    });
    return items;
  }

  static async getWarehouseInventory(warehouseId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = { warehouseId: BigInt(warehouseId) };
    const [data, total] = await Promise.all([
      prisma.inventory.findMany({ where, skip, take: limit, include: { catalogItem: true } }),
      prisma.inventory.count({ where })
    ]);
    return { data, total, page, limit };
  }

  static async reserveInventory(orderId: string, catalogItemId: string, quantity: number, eventDate: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Find where we can reserve from (simplest approach: just reserve globally)
      const res = await tx.inventoryReservation.create({
        data: {
          orderId: BigInt(orderId),
          catalogItemId: BigInt(catalogItemId),
          quantityReserved: quantity,
          eventDate: new Date(eventDate),
          createdBy: BigInt(userId)
        }
      });
      // Need to adjust inventory quantity_reserved? Assuming simplified logic here.
      // E.g., we add to reserved, deduct from available on a specific warehouse later or sum it up.
      return res;
    });
  }
}