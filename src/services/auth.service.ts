import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  userId: number;
  oldPassword: string;
  newPassword: string;
}

export const authService = {
  /**
   * Authenticate user credentials and return a JWT token.
   */
  async login(payload: LoginPayload) {
    const { username, password } = payload;

    const user = await prisma.user.findFirst({
      where: { username },
      include: {
        role: {
          include: {
            rolePermissions: true,
          },
        },
      },
    });

    if (!user) {
      const err: Error & { statusCode?: number } = new Error(
        'Tên đăng nhập hoặc mật khẩu không chính xác (MSG-LG01).'
      );
      err.statusCode = 401;
      throw err;
    }

    if (user.status === 'DEACTIVATED' || user.status === 'INACTIVE') {
      const err: Error & { statusCode?: number } = new Error(
        'Tài khoản của bạn đã bị vô hiệu hóa hoặc tạm khóa (MSG-LG02).'
      );
      err.statusCode = 403;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const err: Error & { statusCode?: number } = new Error(
        'Tên đăng nhập hoặc mật khẩu không chính xác (MSG-LG01).'
      );
      err.statusCode = 401;
      throw err;
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: user.id,
        details: { username: user.username },
      },
    });

    const tokenPayload = {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.roleName,
    };

    const token = jwt.sign(tokenPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: {
          id: user.role.id,
          roleName: user.role.roleName,
          permissions: user.role.rolePermissions.map((rp: { permission: string }) => rp.permission),
        },
      },
    };
  },

  /**
   * Change user password after verifying the old password.
   */
  async changePassword(payload: ChangePasswordPayload) {
    const { userId, oldPassword, newPassword } = payload;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err: Error & { statusCode?: number } = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isOldPasswordValid) {
      const err: Error & { statusCode?: number } = new Error(
        'Mật khẩu hiện tại không chính xác (MSG-CP02).'
      );
      err.statusCode = 401;
      throw err;
    }

    // Password strength check: min 8 chars, has uppercase, lowercase, digit, special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      const err: Error & { statusCode?: number } = new Error(
        'Mật khẩu mới không đủ độ an toàn hoặc trùng mật khẩu cũ (MSG-CP03).'
      );
      err.statusCode = 400;
      throw err;
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      const err: Error & { statusCode?: number } = new Error(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại (MSG-CP03).'
      );
      err.statusCode = 400;
      throw err;
    }

    const newHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CHANGE_PASSWORD',
        entityType: 'User',
        entityId: userId,
      },
    });
  },
};
