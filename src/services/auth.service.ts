import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

class AuthService {
  public async login(username: string, password: string, ipAddress?: string) {
    const user = await prisma.internalUser.findUnique({
      where: { username },
      include: { role: true }
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Invalid username or password.', 401, 'MSG-UC01-02');
    }

    if (user.status !== 'active') {
      throw new AppError('Account is locked or inactive.', 403, 'MSG-UC01-03');
    }

    const expiresIn = 86400; // 24 hours
    const token = jwt.sign({
      userId: user.userId.toString(),
      role: { roleId: user.role.roleId.toString(), roleName: user.role.roleName }
    }, env.JWT_SECRET, {
      expiresIn,
    });

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
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: {
          roleId: user.role.roleId,
          roleName: user.role.roleName
        },
        status: user.status,
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
      throw new AppError('User not found.', 404);
    }

    if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
      throw new AppError('Old password incorrect.', 400, 'MSG-UC02-01');
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
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
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
        role: {
          select: {
            roleId: true,
            roleName: true
          }
        },
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return user;
  }

  public async registerDeviceToken(userId: string, fcmToken: string, platform: string) {
    const existing = await prisma.deviceToken.findUnique({
      where: { fcmToken }
    });

    if (existing) {
      await prisma.deviceToken.update({
        where: { deviceTokenId: existing.deviceTokenId },
        data: {
          userId: BigInt(userId),
          platform,
          isActive: true,
          lastUsedAt: new Date(),
        }
      });
    } else {
      await prisma.deviceToken.create({
        data: {
          userId: BigInt(userId),
          fcmToken,
          platform,
          isActive: true,
          lastUsedAt: new Date(),
        }
      });
    }
  }
}

export const authService = new AuthService();
