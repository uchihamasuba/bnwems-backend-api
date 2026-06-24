import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';

class AuthService {
  public async login(username: string, password: string, ipAddress?: string) {
    const user = await prisma.internalUser.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('Invalid username or password.', 401, 'MSG-UC01-02');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is locked or inactive.', 403, 'MSG-UC01-03');
    }

    const expiresIn = 86400; // 24 hours
    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'InternalUser',
        entityId: user.id,
        ipAddress: ipAddress || null,
      },
    });

    return {
      token,
      expiresIn,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  public async logout(userId: string, ipAddress?: string) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        entityType: 'InternalUser',
        entityId: userId,
        ipAddress: ipAddress || null,
      },
    });
  }

  public async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await prisma.internalUser.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
      throw new AppError('Old password incorrect.', 400, 'MSG-UC02-01');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.internalUser.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CHANGE_PASSWORD',
        entityType: 'InternalUser',
        entityId: user.id,
      },
    });
  }

  public async profile(userId: string) {
    const user = await prisma.internalUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
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
}

export const authService = new AuthService();
