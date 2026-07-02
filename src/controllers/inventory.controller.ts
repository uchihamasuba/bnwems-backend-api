import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';

export const getInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const equipmentItemId = req.query.equipmentItemId as string | undefined;

    const { inventory, totalCount } = await inventoryService.getInventory(equipmentItemId, page, limit);

    res.status(200).json({
      success: true,
      data: inventory,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const createInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newInventory = await inventoryService.createInventory(req.body);

    res.status(201).json({
      success: true,
      message: 'Tạo dữ liệu kho thành công.',
      data: newInventory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedInventory = await inventoryService.updateInventory(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Cập nhật dữ liệu kho thành công.',
      data: updatedInventory,
    });
  } catch (error) {
    next(error);
  }
};

export const checkAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventDate, itemId } = req.query;

    const data = await inventoryService.checkAvailability(eventDate as string, itemId as string);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reserveInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, items, eventDate } = req.body;
    const userId = (req as any).user?.userId || '1';

    const data = await inventoryService.reserveInventory(orderId, items, eventDate, userId);

    res.status(200).json({
      success: true,
      message: 'Giữ chỗ kho thành công.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportType = req.query.reportType as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await inventoryService.getInventoryReports(reportType, page, limit);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const checkoutInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = await inventoryService.checkoutInventory(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Xuất kho thành công.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const returnInventory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const data = await inventoryService.returnInventory(userId, req.body);

    res.status(200).json({
      success: true,
      message: 'Nhập lại kho thành công.',
      data,
    });
  } catch (error) {
    next(error);
  }
};
