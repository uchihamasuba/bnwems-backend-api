import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class InventoryService {
  public async getInventory(warehouseId?: string, catalogItemId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (warehouseId) whereClause.warehouseId = warehouseId;
    if (catalogItemId) whereClause.catalogItemId = catalogItemId;

    const [inventory, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    return { inventory, totalCount };
  }

  public async checkAvailability(eventDate: string, itemId: string) {
    const inventories = await prisma.inventory.findMany({
      where: { catalogItemId: itemId },
    });

    let totalAvailable = 0;
    for (const inv of inventories) {
      totalAvailable += inv.availableQuantity - (inv.reservedQuantity + inv.checkedOutQuantity + inv.damagedQuantity + inv.lostQuantity);
    }

    return {
      catalogItemId: itemId,
      isAvailable: totalAvailable > 0,
      availableQuantityOnDate: totalAvailable > 0 ? totalAvailable : 0,
    };
  }

  public async reserveInventory(orderId: string, items: any[]) {
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({
        where: { catalogItemId: item.catalogItemId },
      });
      if (!inv) {
        throw new AppError('Item not found in inventory', 404);
      }
      
      const available = inv.availableQuantity - (inv.reservedQuantity + inv.checkedOutQuantity + inv.damagedQuantity + inv.lostQuantity);
      if (item.quantity > available) {
        throw new AppError('Insufficient inventory available for the requested date.', 400, 'MSG-UC13-04');
      }

      await prisma.inventory.update({
        where: { id: inv.id },
        data: {
          reservedQuantity: inv.reservedQuantity + item.quantity,
        },
      });
    }
  }
}

export const inventoryService = new InventoryService();
