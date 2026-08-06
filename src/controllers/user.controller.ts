import { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { AuthRequest } from '../middlewares/auth.middleware';
import { userService } from '../services/user.service';

import { AppError } from '../middlewares/error.middleware';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as Role;
    const status = req.query.status as UserStatus;

    const userObj = (req as AuthRequest).user!;
    const userRoleName = userObj.role as Role;
    let allowedRoles: Role[] = [];
    if (role) allowedRoles.push(role);

    if (userRoleName === Role.MANAGER) {
      if (role && !([Role.LEADER, Role.TECHNICAL] as Role[]).includes(role)) {
        return next(
          new AppError('MANAGER chỉ được xem danh sách Trưởng nhóm hoặc Nhân viên kỹ thuật.', 403),
        );
      }
      if (!role) {
        allowedRoles = [Role.LEADER, Role.TECHNICAL];
      }
    }

    const { users, totalCount } = await userService.getUsers(
      page,
      limit,
      search,
      allowedRoles,
      status,
    );

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
      message: 'Tạo người dùng thành công.',
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
      message: 'Cập nhật người dùng thành công.',
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
      message: 'Cập nhật trạng thái người dùng thành công.',
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
      message: 'Đặt lại mật khẩu người dùng thành công.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actionUserId = req.user!.userId;
    const role = req.user!.role;

    if (role !== Role.ADMIN && actionUserId !== id) {
      throw new AppError('Bạn không có quyền thực hiện thao tác này.', 403, 'MSG-UC04-03');
    }

    if (!req.file) {
      throw new AppError('Không có tệp được cung cấp.', 400, 'MSG-UF-01');
    }

    const { UploadService } = await import('../services/upload.service');
    const uploadResult = await UploadService.uploadImageToFirebase(req.file, 'avatars');
    const avatarUrl = uploadResult.url;

    await userService.updateUser(id, { avatarUrl }, actionUserId);

    res.status(200).json({
      success: true,
      code: 'MSG-UF-05',
      message: 'Cập nhật ảnh đại diện thành công.',
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
