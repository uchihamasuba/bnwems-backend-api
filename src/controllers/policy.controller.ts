import { Request, Response, NextFunction } from 'express';
import { policyService } from '../services/policy.service';
import { BigIntUtils } from '../utils/bigint.util';
import { PolicyType } from '@prisma/client';

export const policyController = {
  async getPolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const policyType = req.query.policyType as PolicyType;
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;

      const { policies, totalCount } = await policyService.getPolicies(policyType, isActive);

      res.status(200).json({
        success: true,
        code: 'MSG-PO-01',
        data: BigIntUtils.toJSON(policies),
        meta: { totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async createPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const newPolicy = await policyService.createPolicy(req.body);

      res.status(201).json({
        success: true,
        code: 'MSG-PO-02',
        message: 'Tạo chính sách thành công.',
        data: BigIntUtils.toJSON(newPolicy),
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedPolicy = await policyService.updatePolicy(req.params.id, req.body);

      res.status(200).json({
        success: true,
        code: 'MSG-PO-03',
        message: 'Cập nhật chính sách thành công.',
        data: BigIntUtils.toJSON(updatedPolicy),
      });
    } catch (error) {
      next(error);
    }
  },
};
