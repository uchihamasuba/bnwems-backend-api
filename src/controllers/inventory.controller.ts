import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';

export const inventoryController = {
  async checkAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await inventoryService.checkAvailability({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        equipmentIds: req.query.equipmentIds as string,
      });
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) { next(err); }
  },

  async createPickList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await inventoryService.createPickList(req.body);
      res.status(201).json({ success: true, statusCode: 201, message: 'Danh sách chuẩn bị xuất kho (Pick List) đã được sinh tự động.' });
    } catch (err) { next(err); }
  },
};
