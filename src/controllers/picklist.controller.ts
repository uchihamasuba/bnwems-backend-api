import { Response, NextFunction } from 'express';
import { PickListService } from '../services/picklist.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class PickListController {
  static async checkoutPickList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await PickListService.checkoutPickList(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã xác nhận xuất kho', result, 'MSG-WC-01');
    } catch (error) { next(error); }
  }

  static async getPickLists(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { assignment_id } = req.query;
      const result = await PickListService.getPickLists(assignment_id as string);
      sendSuccess(res, 'Danh sách phiếu xuất kho', result);
    } catch (error) { next(error); }
  }
}
