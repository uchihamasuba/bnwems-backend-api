import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';

export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await reportService.getRevenueReport(startDate as string, endDate as string);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await reportService.getInventoryReport(startDate as string, endDate as string);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.getAdminDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getManagerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await reportService.getManagerDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getVerificationReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.query;

    const data = await reportService.getVerificationReport(orderId as string);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
