import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getProfile(req.user!.userId);
    sendSuccess(res, 'Success', data);
  } catch (error) { next(error); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, 'Cập nhật hồ sơ thành công', null, 'MSG-UC-06');
  } catch (error) { next(error); }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await userService.changePassword(
      req.user!.userId, 
      req.body.current_password, 
      req.body.new_password,
      req.ip,
      req.headers['user-agent']
    );
    sendSuccess(res, 'Đổi mật khẩu thành công', null, 'MSG-CP-01');
  } catch (error) { next(error); }
};

export const getAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const { assigned_date, status } = req.query;
    const result = await userService.getAssignments(req.user!.userId, page, limit, assigned_date as string, status as string);
    sendSuccess(res, 'Danh sách nhiệm vụ', result.data, 'MSG-SUCCESS', 200, result.meta);
  } catch (error) { next(error); }
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const isRead = req.query.is_read ? req.query.is_read === 'true' : undefined;

    const { data, meta } = await userService.getNotifications(req.user!.userId, page, limit, isRead);
    sendSuccess(res, 'Success', data, 'SUCCESS', 200, meta);
  } catch (error) { next(error); }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.markNotificationRead(req.user!.userId, req.params.id);
    sendSuccess(res, 'Đã đánh dấu đã đọc', data);
  } catch (error) { next(error); }
};

// Admin
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query && req.query.page) as string) || 1;
    const limit = parseInt((req.query && req.query.limit) as string) || 20;
    const { search, role_id, status } = req.query || {};

    const { data, meta } = await userService.getAllUsers(page, limit, search as string, role_id as string, status as string);
    sendSuccess(res, 'Success', data, 'SUCCESS', 200, meta);
  } catch (error) { next(error); }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.createUser({ ...req.body, created_by: req.user!.userId });
    sendSuccess(res, 'Tạo tài khoản thành công', data, 'MSG-AU-01', 201);
  } catch (error) { next(error); }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.updateUser(req.params.id, req.body);
    sendSuccess(res, 'Cập nhật người dùng thành công', data, 'MSG-AU-05');
  } catch (error) { next(error); }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.updateUserStatus(req.user!.userId, req.params.id, req.body.status);
    sendSuccess(res, 'Đã cập nhật trạng thái tài khoản', data, 'MSG-DU-01');
  } catch (error) { next(error); }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.resetPassword(req.user!.userId, req.params.id, req.body.new_password);
    sendSuccess(res, 'Đặt lại mật khẩu thành công', data, 'MSG-RP-01');
  } catch (error) { next(error); }
};

export const assignRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.assignRole(req.params.id, req.body.role_id);
    sendSuccess(res, 'Gán vai trò thành công', data, 'MSG-AR-01');
  } catch (error) { next(error); }
};