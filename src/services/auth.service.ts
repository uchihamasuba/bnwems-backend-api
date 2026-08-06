import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

class AuthService {
  // Maps Prisma Role enum -> frontend roleName string
  private mapRole(role: string): { roleName: string } {
    const roleMap: Record<string, string> = {
      ADMIN: 'Admin',
      MANAGER: 'Manager',
      LEADER: 'LEADER_STAFF',
      TECHNICAL: 'TECHNICAL_STAFF',
    };
    return { roleName: roleMap[role] ?? role };
  }

  // Maps Prisma UserStatus enum -> frontend status string
  private mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      SUSPENDED: 'locked',
    };
    return statusMap[status] ?? status.toLowerCase();
  }

  public async login(username: string, password: string, ipAddress?: string) {
    const user = await prisma.internalUser.findUnique({
      where: { username },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Tên đăng nhập hoặc mật khẩu không hợp lệ.', 401, 'MSG-UC01-02');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Tài khoản bị khóa hoặc không hoạt động.', 403, 'MSG-UC01-03');
    }

    const expiresIn = 86400; // 24 hours
    const token = jwt.sign(
      {
        userId: user.userId.toString(),
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn,
      },
    );

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'LOGIN',
        entityType: 'InternalUser',
        entityId: user.userId,
      },
    });

    return {
      token,
      expiresIn,
      user: {
        userId: user.userId.toString(),
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: this.mapRole(user.role),
        status: this.mapStatus(user.status),
      },
    };
  }

  public async logout(userId: string, ipAddress?: string) {
    await prisma.auditLog.create({
      data: {
        userId: BigInt(userId),
        action: 'LOGOUT',
        entityType: 'InternalUser',
        entityId: BigInt(userId),
      },
    });
  }

  public async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.internalUser.findUnique({ where: { userId: BigInt(userId) } });
    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404);
    }

    if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
      throw new AppError('Mật khẩu cũ không đúng.', 400, 'MSG-UC02-01');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.internalUser.update({
      where: { userId: BigInt(userId) },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: 'CHANGE_PASSWORD',
        entityType: 'InternalUser',
        entityId: user.userId,
      },
    });
  }

  public async profile(userId: string) {
    const user = await prisma.internalUser.findUnique({
      where: { userId: BigInt(userId) },
      select: {
        userId: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng.', 404);
    }

    return {
      ...user,
      userId: user.userId.toString(),
      role: this.mapRole(user.role),
      status: this.mapStatus(user.status),
    };
  }

  public async updateProfile(userId: string, data: any) {
    const user = await prisma.internalUser.update({
      where: { userId: BigInt(userId) },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      },
      select: {
        userId: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      userId: user.userId.toString(),
      role: this.mapRole(user.role),
      status: this.mapStatus(user.status),
    };
  }

  public async registerDeviceToken(userId: string, fcmToken: string, platform: any) {
    const existing = await prisma.deviceToken.findUnique({
      where: { fcmToken },
    });

    if (existing) {
      await prisma.deviceToken.update({
        where: { deviceTokenId: existing.deviceTokenId },
        data: {
          userId: BigInt(userId),
          platform,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
    } else {
      await prisma.deviceToken.create({
        data: {
          userId: BigInt(userId),
          fcmToken,
          platform,
          isActive: true,
          lastUsedAt: new Date(),
        },
      });
    }
  }
}

export const authService = new AuthService();
