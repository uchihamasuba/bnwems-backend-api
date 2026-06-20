import prisma from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class ChangeRequestService {
  static async reviewChangeRequest(id: string, decision: string, reviewNotes: string, userId: string) {
    if (!['approved', 'rejected'].includes(decision)) {
      throw new AppError('Decision must be approved or rejected', 400);
    }
    const cr = await prisma.changeRequest.update({
      where: { id: BigInt(id) },
      data: {
        status: decision,
        reviewedBy: BigInt(userId),
        reviewedAt: new Date()
      }
    });

    return {
      id: Number(cr.id),
      status: cr.status
    };
  }
}
