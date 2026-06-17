import { Request, Response, NextFunction } from 'express';
import { equipmentService } from '../services/equipment.service';

export const equipmentController = {
  async getEquipments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await equipmentService.getEquipments({
        categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
        search: req.query.search as string | undefined,
      });
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) {
      next(err);
    }
  },
};
