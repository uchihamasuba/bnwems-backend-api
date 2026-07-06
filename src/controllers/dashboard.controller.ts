import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { BigIntUtils } from '../utils/bigint.util';

export const dashboardController = {
  async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getAdminDashboard();
      res.status(200).json({
        success: true,
        code: 'MSG-RP-03',
        data: BigIntUtils.toJSON(data),
      });
    } catch (error) {
      next(error);
    }
  },

  async getManagerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getManagerDashboard();
      res.status(200).json({
        success: true,
        code: 'MSG-RP-04',
        data: BigIntUtils.toJSON(data),
      });
    } catch (error) {
      next(error);
    }
  },

  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate || isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
        return res.status(400).json({
          success: false,
          code: 'MSG-UC07-01',
          message: 'Khoảng thời gian báo cáo không hợp lệ.',
        });
      }
      const data = await dashboardService.getRevenueReport(startDate, endDate);
      res.status(200).json({
        success: true,
        code: 'MSG-RP-01',
        data: BigIntUtils.toJSON(data),
      });
    } catch (error) {
      next(error);
    }
  },

  async getInventoryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      const data = await dashboardService.getInventoryReport(startDate || '', endDate || '');
      res.status(200).json({
        success: true,
        code: 'MSG-RP-02',
        data: BigIntUtils.toJSON(data),
      });
    } catch (error) {
      next(error);
    }
  },

  async getOperationalVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.query.orderId as string;
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Missing orderId',
        });
      }
      const data = await dashboardService.getOperationalVerification(orderId);
      res.status(200).json({
        success: true,
        code: 'MSG-RP-05',
        data: BigIntUtils.toJSON(data),
      });
    } catch (error) {
      next(error);
    }
  },

  async getManagerApprovals(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getManagerApprovals();
      res.status(200).json({
        success: true,
        code: 'MSG-RP-06',
        message: 'Pending approvals retrieved successfully',
        data: BigIntUtils.toJSON(data),
      });
    } catch (error) {
      next(error);
    }
  },
};
