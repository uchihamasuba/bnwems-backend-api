import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { sendSuccess } from '../utils/response';

export class ReportController {
  static async getAdminDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getAdminDashboard();
      sendSuccess(res, 'Dữ liệu dashboard quản trị', data);
    } catch (error) { next(error); }
  }

  static async getOperationsDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getOperationsDashboard();
      sendSuccess(res, 'Dữ liệu dashboard vận hành', data);
    } catch (error) { next(error); }
  }

  static async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date, period } = req.query;
      const data = await ReportService.getRevenueReport(start_date as string, end_date as string, period as string);
      sendSuccess(res, 'Báo cáo doanh thu', data);
    } catch (error) { next(error); }
  }

  static async getOrdersReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date } = req.query;
      const data = await ReportService.getOrdersReport(start_date as string, end_date as string);
      sendSuccess(res, 'Báo cáo đơn hàng', data);
    } catch (error) { next(error); }
  }

  static async getInventoryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getInventoryReport();
      sendSuccess(res, 'Thống kê tồn kho', data);
    } catch (error) { next(error); }
  }

  static async getStaffReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date } = req.query;
      const data = await ReportService.getStaffReport(start_date as string, end_date as string);
      sendSuccess(res, 'Báo cáo nhân sự', data);
    } catch (error) { next(error); }
  }

  static async getWarehouseReturnsReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date } = req.query;
      const data = await ReportService.getWarehouseReturnsReport(start_date as string, end_date as string);
      sendSuccess(res, 'Báo cáo hoàn trả kho', data);
    } catch (error) { next(error); }
  }

  static async getSupplierDebtReport(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getSupplierDebtReport();
      sendSuccess(res, 'Báo cáo công nợ nhà cung cấp', data);
    } catch (error) { next(error); }
  }

  static async getWagesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { start_date, end_date } = req.query;
      const data = await ReportService.getWagesReport(start_date as string, end_date as string);
      sendSuccess(res, 'Báo cáo quỹ lương', data);
    } catch (error) { next(error); }
  }
}