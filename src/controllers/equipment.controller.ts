import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { equipmentService } from '../services/equipment.service';

export const getEquipments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const status = req.query.status as string;

    const { items, totalCount } = await equipmentService.getEquipments(page, limit, search, category, status);

    res.status(200).json({
      success: true,
      data: items,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const getEquipmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await equipmentService.getEquipmentById(id);

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createEquipment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actionUserId = req.user!.userId;
    const newItem = await equipmentService.createEquipment(req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Equipment item created successfully.',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEquipment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const actionUserId = req.user!.userId;

    await equipmentService.updateEquipment(id, req.body, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Equipment item updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateEquipment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actionUserId = req.user!.userId;

    await equipmentService.deactivateEquipment(id, status, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Equipment item status changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
