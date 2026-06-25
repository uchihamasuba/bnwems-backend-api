import { prisma } from '../config/database';

class ChangeRequestService {
  public async createChangeRequest(orderId: string, data: any, userId: string) {
    const { type, items } = data;

    const newRequest = await prisma.changeRequest.create({
      data: {
        orderId: BigInt(orderId),
        type: type || 'add',
        status: 'pending',
        requestedBy: BigInt(userId),
      },
    });

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await prisma.changeRequestItem.create({
          data: {
            changeRequestId: newRequest.changeRequestId,
            catalogItemId: BigInt(item.catalogItemId),
            quantity: item.quantity,
            action: item.action || 'add'
          }
        });
      }
    }

    return newRequest;
  }

  public async approveChangeRequest(id: string, status: string) {
    const cr = await prisma.changeRequest.update({
      where: { changeRequestId: BigInt(id) },
      data: { status: status as any },
    });

    // If APPROVED, BR-27-01: Approval updates Order financial totals.
    // Assuming updating Settlement or Quotation logic goes here in a real scenario.
  }
}

export const changeRequestService = new ChangeRequestService();
