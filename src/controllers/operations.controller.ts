import { Request, Response, NextFunction } from 'express';
import { operationsService } from '../services/operations.service';
import { BigIntUtils } from '../utils/bigint.util';
import { ScheduleStatus, SurveyStatus } from '@prisma/client';

export const operationsController = {
  // ============================================================================
  // WORK TASKS
  // ============================================================================

  async getWorkTasks(req: Request, res: Response, next: NextFunction) {
    try {
      let isActive: boolean | undefined = undefined;
      if (req.query.isActive !== undefined) {
        isActive = req.query.isActive === 'true';
      }

      const tasks = await operationsService.getWorkTasks(isActive);

      res.status(200).json({
        success: true,
        code: 'MSG-SV-01',
        data: BigIntUtils.toJSON(tasks),
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // SCHEDULE PLANS
  // ============================================================================

  async getSchedulePlans(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const orderId = req.query.orderId as string;
      const assignedTo = req.query.assignedTo as string;
      const status = req.query.status as ScheduleStatus;
      const date = req.query.date as string;

      const { plans, totalCount } = await operationsService.getSchedulePlans(
        page,
        limit,
        orderId,
        assignedTo,
        status,
        date,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-SV-02',
        data: BigIntUtils.toJSON(plans),
        meta: { page, limit, totalCount },
      });
    } catch (error) {
      next(error);
    }
  },

  async createSchedulePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await operationsService.createSchedulePlan(req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-SV-03',
        message: 'Đã tạo phân công và gửi thông báo cho nhân viên.',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSchedulePlan(req: Request, res: Response, next: NextFunction) {
    try {
      await operationsService.updateSchedulePlan(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Cập nhật phân công thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSchedulePlanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes, evidenceId } = req.body;
      await operationsService.updateSchedulePlanStatus(req.params.id, status, notes, evidenceId);

      res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái phân công thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // SURVEY REPORTS
  // ============================================================================

  async getOrderSurveyReports(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId;
      const reports = await operationsService.getOrderSurveyReports(orderId);

      res.status(200).json({
        success: true,
        code: 'MSG-SV-04',
        data: BigIntUtils.toJSON(reports),
      });
    } catch (error) {
      next(error);
    }
  },

  async getSurveyReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await operationsService.getSurveyReportById(req.params.id);

      res.status(200).json({
        success: true,
        data: BigIntUtils.toJSON(report),
      });
    } catch (error) {
      next(error);
    }
  },

  async createSurveyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await operationsService.createSurveyReport(req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-SV-05',
        message: 'Đã nộp báo cáo khảo sát thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async confirmSurveyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      const { status } = req.body;
      await operationsService.confirmSurveyReport(req.params.id, status, userId);

      res.status(200).json({
        success: true,
        code: 'MSG-SV-06',
        message: 'Báo cáo khảo sát đã được xác nhận.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ============================================================================
  // MOBILE FIELD OPS
  // ============================================================================

  async getMobileSchedulePlans(req: Request, res: Response, next: NextFunction) {
    try {
      // Typically mobile only sees assigned to them
      const userId = (req as any).user!.userId;
      const status = req.query.status as ScheduleStatus;
      const date = req.query.date as string;

      // page, limit fixed for now or from query
      const { plans } = await operationsService.getSchedulePlans(
        1,
        100,
        undefined,
        userId,
        status,
        date,
      );

      res.status(200).json({
        success: true,
        code: 'MSG-MO-01',
        data: BigIntUtils.toJSON(plans),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateMobileSchedulePlanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, notes } = req.body;
      await operationsService.updateSchedulePlanStatus(req.params.id, status, notes);

      res.status(200).json({
        success: true,
        code: 'MSG-MO-02',
        message: 'Cập nhật tiến độ công việc thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async getMobileOrderDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await operationsService.getOrderItemsForPickList(req.params.id);

      res.status(200).json({
        success: true,
        code: 'MSG-MO-03',
        data: BigIntUtils.toJSON(details),
      });
    } catch (error) {
      next(error);
    }
  },

  async handoverSchedulePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { notes, evidenceId } = req.body;
      await operationsService.updateSchedulePlanStatus(
        req.params.id,
        ScheduleStatus.COMPLETED,
        notes,
        evidenceId,
      );

      res.status(201).json({
        success: true,
        code: 'MSG-MO-04',
        message: 'Tạo biên bản bàn giao thành công.',
      });
    } catch (error) {
      next(error);
    }
  },

  async createCollectedEquipmentReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user!.userId;
      await operationsService.createCollectedEquipmentReport(req.params.id, req.body, userId);

      res.status(201).json({
        success: true,
        code: 'MSG-MO-05',
        message: 'Gửi báo cáo thu hồi/hư hỏng thành công.',
      });
    } catch (error) {
      next(error);
    }
  },
};
