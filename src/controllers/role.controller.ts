import { Request, Response, NextFunction } from 'express';
import * as roleService from '../services/role.service';
import { sendSuccess } from '../utils/response';

export const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.getAllRoles();
    sendSuccess(res, 'Success', data);
  } catch (error) { next(error); }
};

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.createRole(req.body);
    sendSuccess(res, 'Tạo vai trò thành công', data, 'MSG-ROLE-01', 201);
  } catch (error) { next(error); }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.updateRole(req.params.id, req.body);
    sendSuccess(res, 'Cập nhật vai trò thành công', data, 'MSG-ROLE-03');
  } catch (error) { next(error); }
};

export const updateRoleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.updateRoleStatus(req.params.id, req.body.status);
    sendSuccess(res, 'Cập nhật trạng thái vai trò thành công', data, 'MSG-ROLE-03');
  } catch (error) { next(error); }
};

export const getUsersByRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.getUsersByRole(req.params.id);
    sendSuccess(res, 'Success', data);
  } catch (error) { next(error); }
};

export const assignPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.assignPermissionsToRole(req.params.id, req.body.permission_ids);
    sendSuccess(res, 'Cập nhật quyền thành công', data, 'MSG-PR-01');
  } catch (error) { next(error); }
};

export const getAllPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await roleService.getAllPermissions();
    sendSuccess(res, 'Success', data);
  } catch (error) { next(error); }
};
