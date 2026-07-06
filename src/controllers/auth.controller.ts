import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { authService } from '../services/auth.service';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password, req.ip);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user) {
      await authService.logout(req.user.userId, req.ip);
    }

    res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công.',
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real app, generate a reset token, save to DB, and send an email.
    // For now, always return 200 OK as per spec.

    res.status(200).json({
      success: true,
      message: 'Nếu tài khoản tồn tại, email khôi phục đã được gửi.',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    await authService.changePassword(userId, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công.',
    });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const user = await authService.profile(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const updateData = req.body;

    const updatedUser = await authService.updateProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ thành công.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const registerDeviceToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { deviceToken, deviceType } = req.body;

    await authService.registerDeviceToken(userId, deviceToken, deviceType);

    res.status(200).json({
      success: true,
      message: 'Đăng ký token thiết bị thành công.',
    });
  } catch (error) {
    next(error);
  }
};
