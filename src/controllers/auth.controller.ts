import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC01-01'));
    }

    const user = await prisma.internalUser.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return next(new AppError('Invalid username or password.', 401, 'MSG-UC01-02'));
    }

    if (user.status !== 'ACTIVE') {
      return next(new AppError('Account is locked or inactive.', 403, 'MSG-UC01-03'));
    }

    const expiresIn = 86400; // 24 hours
    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn,
    });

    // Log activity
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entityType: 'InternalUser',
        entityId: user.id,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        expiresIn,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // With stateless JWT, logout is handled client-side by deleting the token.
    // We just log the activity.
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'LOGOUT',
          entityType: 'InternalUser',
          entityId: req.user.userId,
          ipAddress: req.ip,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    
    // In a real app, generate a reset token, save to DB, and send an email.
    // For now, always return 200 OK as per spec.

    res.status(200).json({
      success: true,
      message: 'If the account exists, a recovery email has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user!.userId;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return next(new AppError('Required information is missing.', 400, 'MSG-UC01-01'));
    }

    if (newPassword !== confirmNewPassword) {
      return next(new AppError('New passwords do not match.', 400, 'MSG-UC01-01'));
    }

    const user = await prisma.internalUser.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    if (!(await bcrypt.compare(oldPassword, user.passwordHash))) {
      return next(new AppError('Old password incorrect.', 400, 'MSG-UC02-01'));
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

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
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
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
