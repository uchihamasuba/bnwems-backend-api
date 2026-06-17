import { Request, Response, NextFunction } from 'express';
import { policyService } from '../services/policy.service';

export const policyController = {
  async createPolicy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await policyService.createPolicy(req.body);
      res.status(201).json({ success: true, statusCode: 201, message: 'Chính sách mới đã được cấu hình thành công.' });
    } catch (err) { next(err); }
  },

  async getPolicies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await policyService.getPolicies(req.query.type as string | undefined);
      res.status(200).json({ success: true, statusCode: 200, data });
    } catch (err) { next(err); }
  },
};
