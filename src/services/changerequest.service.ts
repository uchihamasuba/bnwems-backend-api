import { prisma } from '../config/database';

class ChangeRequestService {
  public async createChangeRequest(orderId: string, data: any, userId: string) {
    const { requestDetails, additionalCost } = data;

    const newRequest = await prisma.changeRequest.create({
      data: {
        orderId,
        requestDetails,
        additionalCost: additionalCost || 0,
        status: 'PENDING',
        requestedBy: userId,
      },
    });

    return newRequest;
  }

  public async approveChangeRequest(id: string, status: string) {
    const cr = await prisma.changeRequest.update({
      where: { id },
      data: { status: status as any },
    });

    // If APPROVED, BR-27-01: Approval updates Order financial totals.
    // Assuming updating Settlement or Quotation logic goes here in a real scenario.
  }
}

export const changeRequestService = new ChangeRequestService();
