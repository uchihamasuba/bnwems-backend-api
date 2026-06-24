import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { userService } from '../services/user.service';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const { users, totalCount } = await userService.getUsers(page, limit, search, role, status);

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
    const actionUserId = req.user!.userId;
    const newUser = await userService.createUser(req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actionUserId = req.user!.userId;

    await userService.updateUser(id, req.body, actionUserId);

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
    const actionUserId = req.user!.userId;

    await userService.updateStatus(id, status, actionUserId);

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
    const actionUserId = req.user!.userId;

    await userService.resetPassword(id, newPassword, actionUserId);

    res.status(200).json({
      success: true,
      message: 'User password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
