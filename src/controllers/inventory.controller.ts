import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class InventoryController {
  static async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const eventDate = req.query.event_date as string;
      const itemIds = req.query.item_ids as string[];
      if (!eventDate || !itemIds) {
        return sendSuccess(res, 'Missing event_date or item_ids', null, 'MSG-IA-ERR', 400);
      }
      const data = await InventoryService.checkAvailability(eventDate, Array.isArray(itemIds) ? itemIds : [itemIds]);
      sendSuccess(res, 'Kiểm tra tồn kho thành công', data, 'MSG-IA-01');
    } catch (error) { next(error); }
  }
}