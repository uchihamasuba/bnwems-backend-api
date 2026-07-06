import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { MovementType, ReportStatus } from '@prisma/client';

class InventoryService {
  public async getInventory(page: number, limit: number, itemId?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (itemId) {
      whereClause.itemId = BigInt(itemId);
    }

    const [inventories, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          item: {
            select: { itemName: true },
          },
        },
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    const formattedInventories = inventories.map((inv) => ({
      ...inv,
      itemName: inv.item?.itemName,
    }));

    return { inventories: formattedInventories, totalCount };
  }

  public async adjustInventory(data: any, actionUserId: string) {
    const { itemId, quantityChange, notes } = data;

    // Run within a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Fetch current inventory
      const inv = await tx.inventory.findUnique({ where: { itemId: BigInt(itemId) } });
      if (!inv) throw new AppError('Không tìm thấy thông tin kho cho thiết bị này.', 404);

      // 2. Update inventory
      const newTotal = inv.quantityTotal + quantityChange;
      const newAvailable = (inv.quantityAvailable || 0) + quantityChange;

      if (newTotal < 0 || newAvailable < 0) {
        throw new AppError('Số lượng sau điều chỉnh không được nhỏ hơn 0.', 400);
      }

      await tx.inventory.update({
        where: { itemId: BigInt(itemId) },
        data: {
          quantityTotal: newTotal,
          quantityAvailable: newAvailable,
        },
      });

      // 3. Log movement
      await tx.inventoryMovement.create({
        data: {
          itemId: BigInt(itemId),
          movementType: MovementType.ADJUSTMENT,
          quantity: quantityChange,
          performedBy: BigInt(actionUserId),
          notes: notes,
        },
      });
    });

    return { success: true };
  }

  public async getInventoryMovements(
    page: number,
    limit: number,
    itemId?: string,
    movementType?: MovementType,
  ) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (itemId) {
      whereClause.itemId = BigInt(itemId);
    }
    if (movementType) {
      whereClause.movementType = movementType;
    }

    const [movements, totalCount] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          item: { select: { itemName: true } },
          performer: { select: { fullName: true } },
        },
      }),
      prisma.inventoryMovement.count({ where: whereClause }),
    ]);

    const formattedMovements = movements.map((m) => ({
      ...m,
      itemName: m.item?.itemName,
      performedByName: m.performer?.fullName,
    }));

    return { movements: formattedMovements, totalCount };
  }

  public async createReturnReport(data: any, actionUserId: string) {
    const { orderId, reportType, notes, items } = data;

    const report = await prisma.collectedEquipmentReport.create({
      data: {
        orderId: BigInt(orderId),
        reportType: reportType,
        notes: notes,
        reportedBy: BigInt(actionUserId),
        status: ReportStatus.SUBMITTED,
        items: {
          create: items.map((i: any) => ({
            itemId: BigInt(i.itemId),
            goodQuantity: i.goodQuantity,
            damagedQuantity: i.damagedQuantity,
            lostQuantity: i.lostQuantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return report;
  }

  public async confirmReturnReport(reportId: string, actionUserId: string) {
    await prisma.$transaction(async (tx) => {
      // 1. Find report
      const report = await tx.collectedEquipmentReport.findUnique({
        where: { reportId: BigInt(reportId) },
        include: { items: true },
      });
      if (!report) throw new AppError('Không tìm thấy báo cáo.', 404);
      if (report.status === ReportStatus.CONFIRMED) {
        throw new AppError('Báo cáo đã được xác nhận trước đó.', 400);
      }

      // 2. Update status
      await tx.collectedEquipmentReport.update({
        where: { reportId: BigInt(reportId) },
        data: { status: ReportStatus.CONFIRMED },
      });

      // 3. Process inventory for each item
      for (const item of report.items) {
        const inv = await tx.inventory.findUnique({ where: { itemId: item.itemId } });
        if (!inv) continue;

        // "Kho công ty" returns items back to available inventory.
        // - goodQuantity returns to Available
        // - damagedQuantity goes to Damaged
        // - lostQuantity reduces Total (and Reserved if it was reserved)

        // This is a simplified model of returns based on UC 2.23:
        // Actually, returning from event reduces Reserved (since they were checked out).
        // Let's assume returning increases Available. Check-out reduces Available and Increases Reserved. Wait.
        // In 05-warehouse-inventory.md:
        // "Confirm Return Report triggers the creation of INBOUND movements, updating quantityTotal and quantityDamaged."
        // We will do:
        const totalReturned = item.goodQuantity + item.damagedQuantity;

        await tx.inventory.update({
          where: { itemId: item.itemId },
          data: {
            quantityAvailable: (inv.quantityAvailable || 0) + item.goodQuantity,
            quantityDamaged: inv.quantityDamaged + item.damagedQuantity,
            // lostQuantity means it's permanently gone, so quantityTotal drops.
            quantityTotal: inv.quantityTotal - item.lostQuantity,
          },
        });

        if (totalReturned > 0) {
          await tx.inventoryMovement.create({
            data: {
              itemId: item.itemId,
              movementType: MovementType.INBOUND,
              quantity: totalReturned,
              performedBy: BigInt(actionUserId),
              notes: `Nhập kho từ báo cáo thu hồi ${reportId}`,
            },
          });
        }
      }
    });

    return { success: true };
  }
}

export const inventoryService = new InventoryService();
