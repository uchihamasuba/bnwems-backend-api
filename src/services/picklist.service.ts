import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class PickListService {
  static async checkoutPickList(id: string, items: any[], userId: string) {
    const pickList = await prisma.pickList.findUnique({
      where: { id: BigInt(id) },
      include: { items: true }
    });
    if (!pickList) throw new AppError('Pick list not found', 404);

    return prisma.$transaction(async (tx) => {
      // 1. Update pick list status
      const updatedPickList = await tx.pickList.update({
        where: { id: BigInt(id) },
        data: { status: 'picked' }
      });

      // 2. Process each item checkout
      for (const reqItem of items) {
        const itemLine = pickList.items.find(i => Number(i.catalogItemId) === Number(reqItem.catalog_item_id));
        if (itemLine) {
          await tx.pickListItem.update({
            where: { id: itemLine.id },
            data: { quantityPicked: reqItem.quantity_picked }
          });
        }
        
        const inv = await tx.inventory.findFirst({
          where: { catalogItemId: BigInt(reqItem.catalog_item_id) }
        });
        
        const beforeQty = inv ? Number(inv.quantityAvailable) : 0;
        const afterQty = beforeQty - reqItem.quantity_picked;

        // 3. Create inventory transaction
        await tx.inventoryTransaction.create({
          data: {
            catalogItemId: BigInt(reqItem.catalog_item_id),
            warehouseId: inv ? inv.warehouseId : BigInt(1),
            transactionType: 'out',
            quantity: reqItem.quantity_picked,
            beforeQty: beforeQty,
            afterQty: afterQty,
            referenceType: 'pick_lists',
            referenceId: pickList.id,
            notes: reqItem.notes || null,
            createdBy: BigInt(userId)
          }
        });

        // 4. Update inventory quantity_available
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantityAvailable: afterQty }
          });
        }
      }

      return {
        id: Number(updatedPickList.id),
        status: updatedPickList.status
      };
    });
  }

  static async getPickLists(assignmentId?: string) {
    const where: any = {};
    if (assignmentId) where.assignmentId = BigInt(assignmentId);

    const pickLists = await prisma.pickList.findMany({
      where,
      include: { items: true }
    });

    return pickLists.map(pl => ({
      id: Number(pl.id),
      order_id: Number(pl.orderId),
      assignment_id: pl.assignmentId ? Number(pl.assignmentId) : null,
      status: pl.status,
      items: pl.items.map(i => ({
        id: Number(i.id),
        catalog_item_id: Number(i.catalogItemId),
        quantity_required: Number(i.quantityRequired),
        quantity_picked: Number(i.quantityPicked)
      }))
    }));
  }
}
