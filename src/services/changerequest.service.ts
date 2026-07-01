import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class ChangeRequestService {
  public async getChangeRequests(page: number, limit: number, orderId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (orderId) {
      whereClause.orderId = BigInt(orderId);
    }
    if (status) {
      whereClause.status = status;
    }

    const [requests, totalCount] = await Promise.all([
      prisma.changeRequest.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.changeRequest.count({ where: whereClause }),
    ]);

    const changeRequestIds = requests.map(req => req.changeRequestId);
    const items = await prisma.changeRequestItem.findMany({
      where: {
        changeRequestId: {
          in: changeRequestIds
        }
      },
      include: {
        equipmentItem: true
      }
    });

    const formattedRequests = requests.map(req => {
      const reqItems = items.filter(item => item.changeRequestId === req.changeRequestId).map(item => ({
        ...item,
        id: item.id.toString(),
        changeRequestId: item.changeRequestId.toString(),
        equipmentItemId: item.equipmentItemId.toString(),
        equipmentItemName: item.equipmentItem?.name,
        equipmentItemCode: item.equipmentItem?.code
      }));
      
      return {
        ...req,
        changeRequestId: req.changeRequestId.toString(),
        orderId: req.orderId.toString(),
        requestedBy: req.requestedBy.toString(),
        approvedBy: req.approvedBy?.toString(),
        reconciledBy: req.reconciledBy?.toString(),
        items: reqItems
      };
    });

    return { requests: formattedRequests, totalCount };
  }

  public async getChangeRequestById(id: string) {
    const req = await prisma.changeRequest.findUnique({
      where: { changeRequestId: BigInt(id) }
    });
    if (!req) throw new AppError('Change request not found', 404);

    const items = await prisma.changeRequestItem.findMany({
      where: { changeRequestId: BigInt(id) },
      include: { equipmentItem: true }
    });

    return {
      ...req,
      changeRequestId: req.changeRequestId.toString(),
      orderId: req.orderId.toString(),
      requestedBy: req.requestedBy.toString(),
      approvedBy: req.approvedBy?.toString(),
      reconciledBy: req.reconciledBy?.toString(),
      items: items.map(item => ({
        ...item,
        id: item.id.toString(),
        changeRequestId: item.changeRequestId.toString(),
        equipmentItemId: item.equipmentItemId.toString(),
        equipmentItemName: item.equipmentItem?.name,
        equipmentItemCode: item.equipmentItem?.code
      }))
    };
  }

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
            equipmentItemId: BigInt(item.equipmentItemId),
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
