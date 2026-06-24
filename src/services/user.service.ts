import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

class UserService {
  public async getUsers(page: number, limit: number, search?: string, role?: string, status?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { username: { contains: search } },
        { fullName: { contains: search } },
      ];
    }
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const [users, totalCount] = await Promise.all([
      prisma.internalUser.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.internalUser.count({ where: whereClause }),
    ]);

    return { users, totalCount };
  }

  public async createUser(data: any, actionUserId: string) {
    const { username, password, fullName, role } = data;

    const existingUser = await prisma.internalUser.findUnique({ where: { username } });
    if (existingUser) {
      throw new AppError('Username already exists.', 400, 'MSG-UC04-05');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.internalUser.create({
      data: {
        username,
        passwordHash,
        fullName,
        role,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'CREATE_USER',
        entityType: 'InternalUser',
        entityId: newUser.id,
      },
    });

    return {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      status: newUser.status,
    };
  }

  public async updateUser(id: string, data: any, actionUserId: string) {
    const { fullName, role } = data;

    const updatedUser = await prisma.internalUser.update({
      where: { id },
      data: { fullName, role },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'UPDATE_USER',
        entityType: 'InternalUser',
        entityId: updatedUser.id,
      },
    });

    return updatedUser;
  }

  public async updateStatus(id: string, status: string, actionUserId: string) {
    await prisma.internalUser.update({
      where: { id },
      data: { status: status as any },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'UPDATE_USER_STATUS',
        entityType: 'InternalUser',
        entityId: id,
        details: { status } as any,
      },
    });
  }

  public async resetPassword(id: string, newPassword: string, actionUserId: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.internalUser.update({
      where: { id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: actionUserId,
        action: 'RESET_PASSWORD',
        entityType: 'InternalUser',
        entityId: id,
      },
    });
  }
}

export const userService = new UserService();
