import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class NotificationService {
  public async getNotifications(userId: string, page: number, limit: number, isReadParam?: string) {
    const skip = (page - 1) * limit;

    const whereClause: any = { userId: BigInt(userId) };
    if (isReadParam !== undefined) {
      whereClause.isRead = isReadParam === 'true';
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    return { notifications, totalCount };
  }

  public async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { notificationId: BigInt(id) },
    });

    if (!notification || notification.userId !== BigInt(userId)) {
      throw new AppError('Notification not found or access denied.', 404, 'MSG-UC03-01');
    }

    await prisma.notification.update({
      where: { notificationId: BigInt(id) },
      data: { isRead: true },
    });
  }

  public async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId: BigInt(userId), isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
