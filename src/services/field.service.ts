import prisma from '../config/database';

export const fieldService = {
  async updateProgress(payload: {
    orderId: number;
    step: string;
    status: string;
    notes?: string;
  }) {
    const progress = await prisma.fieldProgress.create({
      data: {
        orderId: payload.orderId,
        step: payload.step as 'TRANSPORTATION' | 'INSTALLATION' | 'COLLECTION' | 'WAREHOUSE_RETURN',
        status: payload.status as 'PROCESSING' | 'COMPLETED',
        notes: payload.notes,
      },
    });

    return progress;
  },

  async submitChangeRequest(payload: {
    orderId: number;
    submittedByLeaderId: number;
    reason: string;
    requestedChanges: { equipmentId: number; action: string; quantity: number }[];
  }) {
    const changeRequest = await prisma.changeRequest.create({
      data: {
        orderId: payload.orderId,
        submittedByLeaderId: payload.submittedByLeaderId,
        reason: payload.reason,
        requestedChanges: payload.requestedChanges,
      },
    });

    return changeRequest;
  },

  async approveChangeRequest(
    id: number,
    payload: { isApproved: boolean; rejectReason?: string }
  ) {
    const changeRequest = await prisma.changeRequest.update({
      where: { id },
      data: {
        isApproved: payload.isApproved,
        rejectReason: payload.rejectReason,
        resolvedAt: new Date(),
      },
    });

    return changeRequest;
  },
};
