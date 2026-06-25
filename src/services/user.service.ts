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
    // role here could be roleName, but API doc specifies role is enum ADMIN, MANAGER, etc.
    // In our schema, role is stored as Role relation. We need to filter by roleName.
    if (role) {
      whereClause.role = { roleName: role };
    }
    if (status) whereClause.status = status;

    const [users, totalCount] = await Promise.all([
      prisma.internalUser.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          userId: true,
          username: true,
          fullName: true,
          role: {
            select: {
              roleId: true,
              roleName: true
            }
          },
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
    const { username, password, fullName, roleId } = data;

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
        roleId: BigInt(roleId),
      },
      include: {
        role: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'CREATE_USER',
        entityType: 'InternalUser',
        entityId: newUser.userId,
      },
    });

    return {
      userId: newUser.userId,
      username: newUser.username,
      fullName: newUser.fullName,
      role: {
        roleId: newUser.role.roleId,
        roleName: newUser.role.roleName
      },
      status: newUser.status,
    };
  }

  public async updateUser(id: string, data: any, actionUserId: string) {
    const { fullName, roleId } = data;

    const updatedUser = await prisma.internalUser.update({
      where: { userId: BigInt(id) },
      data: { 
        ...(fullName && { fullName }), 
        ...(roleId && { roleId: BigInt(roleId) }) 
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_USER',
        entityType: 'InternalUser',
        entityId: updatedUser.userId,
      },
    });

    return updatedUser;
  }

  public async updateStatus(id: string, status: string, actionUserId: string) {
    await prisma.internalUser.update({
      where: { userId: BigInt(id) },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'UPDATE_USER_STATUS',
        entityType: 'InternalUser',
        entityId: BigInt(id),
      },
    });
  }

  public async resetPassword(id: string, newPassword: string, actionUserId: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.internalUser.update({
      where: { userId: BigInt(id) },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: BigInt(actionUserId),
        action: 'RESET_PASSWORD',
        entityType: 'InternalUser',
        entityId: BigInt(id),
      },
    });
  }
}

export const userService = new UserService();
