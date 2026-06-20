import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, device_token, device_type } = req.body;
    const data = await authService.login(username, password, device_token, device_type);
    
    sendSuccess(res, 'Đăng nhập thành công', data, 'MSG-LG-01');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { device_token } = req.body;
    await authService.logout(device_token);
    
    sendSuccess(res, 'Đăng xuất thành công', null, 'MSG-LG-06');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    await authService.forgotPassword(username);
    
    sendSuccess(res, 'Nếu tài khoản tồn tại, mã xác nhận đã được gửi', null, 'MSG-AUTH0301-OK');
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOTP = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, otp } = req.body;
    if (!username || !otp) {
      throw new Error('Missing username or otp');
    }
    const data = await authService.verifyForgotPasswordOTP(username, otp);
    sendSuccess(res, 'Xác minh OTP thành công', data);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reset_token, new_password } = req.body;
    if (!reset_token || !new_password) {
      throw new Error('Missing reset_token or new_password');
    }
    await authService.resetPassword(reset_token, new_password);
    sendSuccess(res, 'Đặt lại mật khẩu thành công', null, 'MSG-AUTH0303');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldToken = req.headers.authorization?.split(' ')[1];
    if (!oldToken) {
      throw new Error('Token is required');
    }
    const data = await authService.refresh(oldToken);
    
    sendSuccess(res, 'Token refreshed', data, 'MSG-AUTH-REFRESH');
  } catch (error) {
    next(error);
  }
};