import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from '../services/warehouse.service';
import { sendSuccess } from '../utils/response';

export class WarehouseController {
  static async getWarehouses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await WarehouseService.getWarehouses();
      sendSuccess(res, 'Danh sách kho', data);
    } catch (error) { next(error); }
  }

  static async updateWarehouse(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await WarehouseService.updateWarehouse(req.params.id, req.body);
      sendSuccess(res, 'Cập nhật kho thành công', data);
    } catch (error) { next(error); }
  }

  static async getWarehouseInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await WarehouseService.getWarehouseInventory(req.params.id);
      sendSuccess(res, 'Tồn kho theo kho', data);
    } catch (error) { next(error); }
  }
}
