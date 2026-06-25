import { prisma } from '../config/database';

class WarehouseService {
  public async getWarehouseHistories(page: number, limit: number, movementType?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (movementType) whereClause.movementType = movementType;

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
    await prisma.$transaction(async (prismaTx) => {
      // 1. Create InventoryReport for checkout
      const report = await prismaTx.inventoryReport.create({
        data: {
          orderId: BigInt(orderId),
          reportType: 'checkout',
          recordedBy: BigInt(actionUserId),
          status: 'confirmed'
        }
      });

      for (const item of items) {
        // 2. Reduce availableQuantity in Inventory
        const inv = await prismaTx.inventory.findFirst({
          where: { warehouseId: BigInt(warehouseId), catalogItemId: BigInt(item.catalogItemId) }
        });
        if (inv) {
          await prismaTx.inventory.update({
            where: { inventoryId: inv.inventoryId },
            data: {
              availableQuantity: Math.max(0, inv.availableQuantity - item.quantity)
            }
          });
        }

        // 3. Add item to InventoryReport
        await prismaTx.inventoryReportItem.create({
          data: {
            inventoryReportId: report.inventoryReportId,
            catalogItemId: BigInt(item.catalogItemId),
            quantity: item.quantity,
            conditionStatus: 'good'
          }
        });
      }

      // 4. Create WarehouseHistory
      await prismaTx.warehouseHistory.create({
        data: {
          warehouseId: BigInt(warehouseId),
          orderId: BigInt(orderId),
          inventoryReportId: report.inventoryReportId,
          movementType: 'out',
          createdBy: BigInt(actionUserId)
        }
      });
    });
  }

  public async returnWarehouse(warehouseId: string, orderId: string, items: any[], actionUserId: string) {
    await prisma.$transaction(async (prismaTx) => {
      // 1. Create InventoryReport for return
      const report = await prismaTx.inventoryReport.create({
        data: {
          orderId: BigInt(orderId),
          reportType: 'return',
          recordedBy: BigInt(actionUserId),
          status: 'confirmed'
        }
      });

      for (const item of items) {
        // 2. Increase availableQuantity in Inventory if condition is good
        if (item.condition !== 'DAMAGED' && item.condition !== 'LOST') {
          const inv = await prismaTx.inventory.findFirst({
            where: { warehouseId: BigInt(warehouseId), catalogItemId: BigInt(item.catalogItemId) }
          });
          if (inv) {
            await prismaTx.inventory.update({
              where: { inventoryId: inv.inventoryId },
              data: {
                availableQuantity: inv.availableQuantity + item.quantity
              }
            });
          }
        } else {
          // If damaged, we might decrease totalQuantity or just not add to availableQuantity
          const inv = await prismaTx.inventory.findFirst({
            where: { warehouseId: BigInt(warehouseId), catalogItemId: BigInt(item.catalogItemId) }
          });
          if (inv) {
            await prismaTx.inventory.update({
              where: { inventoryId: inv.inventoryId },
              data: {
                totalQuantity: Math.max(0, inv.totalQuantity - item.quantity)
              }
            });
          }
        }

        // 3. Add item to InventoryReport
        await prismaTx.inventoryReportItem.create({
          data: {
            inventoryReportId: report.inventoryReportId,
            catalogItemId: BigInt(item.catalogItemId),
            quantity: item.quantity,
            conditionStatus: item.condition ? item.condition.toLowerCase() : 'good'
          }
        });
      }

      // 4. Create WarehouseHistory
      await prismaTx.warehouseHistory.create({
        data: {
          warehouseId: BigInt(warehouseId),
          orderId: BigInt(orderId),
          inventoryReportId: report.inventoryReportId,
          movementType: 'return',
          createdBy: BigInt(actionUserId)
        }
      });
    });
  }
}

export const warehouseService = new WarehouseService();
