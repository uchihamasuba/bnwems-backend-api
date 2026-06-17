import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { env } from '../config/env';

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  roleId: number;
}

export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
}

export const userService = {
  /**
   * Get paginated list of all users with role info.
   */
  async getUsers(query: GetUsersQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
        { username: { contains: query.search } },
      ];
    }

    if (query.roleId) {
      where.roleId = Number(query.roleId);
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          role: { select: { id: true, roleName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
      data: users,
    };
  },

  /**
   * Create a new user account with hashed password.
   */
  async createUser(payload: CreateUserPayload) {
    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: payload.username }, { email: payload.email }],
      },
    });

    if (existing) {
      const err: Error & { statusCode?: number } = new Error(
        'Tên đăng nhập đã tồn tại trong hệ thống (MSG-AU02).'
      );
      err.statusCode = 400;
      throw err;
    }

    // Check role is active
    const role = await prisma.role.findUnique({ where: { id: payload.roleId } });
    if (!role || !role.isActive) {
      const err: Error & { statusCode?: number } = new Error(
        'Vai trò được chọn hiện đang không hoạt động (MSG-AU04).'
      );
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(payload.password, env.BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username: payload.username,
        passwordHash,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        roleId: payload.roleId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    return user;
  },

  /**
   * Soft-delete (deactivate) a user account.
   */
  async deactivateUser(targetId: number, requestingUserId: number) {
    if (targetId === requestingUserId) {
      const err: Error & { statusCode?: number } = new Error(
        'Bạn không được phép tự vô hiệu hóa tài khoản active chính mình đang sử dụng (MSG-DU02).'
      );
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) {
      const err: Error & { statusCode?: number } = new Error(
        'Không tìm thấy thông tin người dùng được chỉ định.'
      );
      err.statusCode = 404;
      throw err;
    }

    await prisma.user.update({
      where: { id: targetId },
      data: { status: 'DEACTIVATED', updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId: requestingUserId,
        action: 'DEACTIVATE_USER',
        entityType: 'User',
        entityId: targetId,
      },
    });
  },
};
