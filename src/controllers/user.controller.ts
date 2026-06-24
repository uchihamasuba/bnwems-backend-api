import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as any;
    const status = req.query.status as any;

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

    res.status(200).json({
      success: true,
      data: users,
      meta: {
        page,
        limit,
        totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, password, fullName, role } = req.body;

    if (!username || !password || !fullName || !role) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC04-01'));
    }

    const existingUser = await prisma.internalUser.findUnique({ where: { username } });
    if (existingUser) {
      return next(new AppError('Username already exists.', 400, 'MSG-UC04-05'));
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
        userId: req.user!.userId,
        action: 'CREATE_USER',
        entityType: 'InternalUser',
        entityId: newUser.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fullName, role } = req.body;

    if (!fullName || !role) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC04-01'));
    }

    const updatedUser = await prisma.internalUser.update({
      where: { id },
      data: { fullName, role },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_USER',
        entityType: 'InternalUser',
        entityId: updatedUser.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(new AppError('Status is required.', 400, 'MSG-UC04-01'));
    }

    await prisma.internalUser.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_USER_STATUS',
        entityType: 'InternalUser',
        entityId: id,
        details: { status },
      },
    });

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return next(new AppError('New password is required.', 400, 'MSG-UC04-01'));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.internalUser.update({
      where: { id },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'RESET_PASSWORD',
        entityType: 'InternalUser',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'User password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
