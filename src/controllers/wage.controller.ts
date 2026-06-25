import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { wageService } from '../services/wage.service';

export const getWagesSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const period = req.query.period as string;
    const userId = req.query.userId as string;
    const status = req.query.status as string;

    const { wages, totalCount } = await wageService.getWagesSummary(page, limit, period, userId, status);

    res.status(200).json({
      success: true,
      data: wages,
      meta: { page, limit, totalCount },
    });
  } catch (error) {
    next(error);
  }
};

export const confirmWage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actionUserId = req.user!.userId;

    await wageService.confirmWage(id, status, actionUserId);

    res.status(200).json({
      success: true,
      message: 'Wage summary confirmed.',
    });
  } catch (error) {
    next(error);
  }
};
