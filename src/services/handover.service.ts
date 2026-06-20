import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class HandoverService {
  static async confirmHandover(id: string, decision: string, notes: string, userId: string) {
    if (!['confirmed', 'rejected'].includes(decision)) {
      throw new AppError('Decision must be confirmed or rejected', 400);
    }
    const updated = await prisma.handover.update({
      where: { id: BigInt(id) },
      data: {
        status: 'confirmed'
      }
    });

    return { id: Number(updated.id), status: updated.status };
  }

  static async createWarehouseReceipt(id: string, userId: string) {
    const handover = await prisma.handover.findUnique({
      where: { id: BigInt(id) },
      include: { items: true }
    });
    if (!handover) throw new AppError('Handover not found', 404);

    return { id: Number(handover.id), items_received: handover.items.length };
  }

  static async updateHandoverItem(handoverId: string, itemId: string, data: any, userId: string) {
    const updated = await prisma.handoverItem.update({
      where: { id: BigInt(itemId) },
      data: {
        itemStatus: data.item_status
        // missing condition_notes in DB for HandoverItem right now, so we just use itemStatus
      }
    });

    return {
      handover_id: Number(updated.handoverId),
      catalog_item_id: Number(updated.catalogItemId),
      item_status: updated.itemStatus
    };
  }

  static async submitHandover(id: string, userId: string) {
    const updated = await prisma.handover.update({
      where: { id: BigInt(id) },
      data: { status: 'submitted' }
    });

    return { id: Number(updated.id), status: updated.status };
  }
}
