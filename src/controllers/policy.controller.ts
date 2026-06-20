import { Request, Response, NextFunction } from 'express';
import { PolicyService } from '../services/policy.service';

export class PolicyController {
  static async getBusinessPolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PolicyService.getBusinessPolicies();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateBusinessPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.params.code;
      const updatedBy = Number((req as any).user?.userId);
      const data = await PolicyService.updateBusinessPolicy(code, req.body, updatedBy);
      res.status(200).json({ success: true, code: 'MSG-DP-01', message: 'Cập nhật chính sách thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async getWageRules(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PolicyService.getWageRules();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createWageRule(req: Request, res: Response, next: NextFunction) {
    try {
      const createdBy = Number((req as any).user?.userId);
      const data = await PolicyService.createWageRule(req.body, createdBy);
      res.status(201).json({ success: true, code: 'MSG-WR-01', message: 'Tạo quy tắc lương thành công', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateWageRule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const data = await PolicyService.updateWageRule(id, req.body);
      res.status(200).json({ success: true, message: 'Cập nhật quy tắc lương thành công', data });
    } catch (error) {
      next(error);
    }
  }
}