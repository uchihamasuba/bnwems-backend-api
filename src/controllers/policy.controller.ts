import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPolicies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policyType = req.query.policyType as string;
    const isActiveParam = req.query.isActive as string;

    const whereClause: any = {};
    if (policyType) whereClause.policyType = policyType;
    if (isActiveParam !== undefined) whereClause.isActive = isActiveParam === 'true';

    const policies = await prisma.businessPolicy.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

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
    const { policyType, name, rules } = req.body;

    if (!policyType || !name || !rules) {
      return next(new AppError('Required information is missing or invalid.', 400, 'MSG-UC06-01'));
    }

    const newPolicy = await prisma.businessPolicy.create({
      data: { policyType, name, rules },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE_POLICY',
        entityType: 'BusinessPolicy',
        entityId: newPolicy.id,
      },
    });

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

    if (!rules) {
      return next(new AppError('Rules are required.', 400, 'MSG-UC06-01'));
    }

    await prisma.businessPolicy.update({
      where: { id },
      data: { rules },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'UPDATE_POLICY',
        entityType: 'BusinessPolicy',
        entityId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Policy updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
