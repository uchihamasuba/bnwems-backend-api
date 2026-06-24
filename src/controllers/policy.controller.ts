import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { policyService } from '../services/policy.service';

export const getPolicies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policyType = req.query.policyType as string;
    const isActiveParam = req.query.isActive as string;

    const policies = await policyService.getPolicies(policyType, isActiveParam);

    res.status(200).json({
      success: true,
      data: policies,
      meta: { totalCount: policies.length },
    });
  } catch (error) {
    next(error);
  }
};

export const createPolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const actionUserId = req.user!.userId;
    const newPolicy = await policyService.createPolicy(req.body, actionUserId);

    res.status(201).json({
      success: true,
      message: 'Policy created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rules } = req.body;
    const actionUserId = req.user!.userId;

    await policyService.updatePolicy(id, rules, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
