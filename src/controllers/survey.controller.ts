import { Request, Response, NextFunction } from 'express';
import { SurveyService } from '../services/survey.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';

export class SurveyController {
  static async scheduleSurvey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.scheduleSurvey(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Đã lên lịch khảo sát', result, 'MSG-SV-01', 201);
    } catch (error) { next(error); }
  }

  static async getSurveysByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.getSurveysByOrder(req.params.id);
      sendSuccess(res, 'Danh sách khảo sát', result);
    } catch (error) { next(error); }
  }

  static async getSurveyReportById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.getSurveyReportById(req.params.id);
      sendSuccess(res, 'Chi tiết báo cáo khảo sát', result);
    } catch (error) { next(error); }
  }

  static async assignSurvey(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.assignSurvey(req.params.id, req.body);
      sendSuccess(res, 'Phân công khảo sát thành công', result);
    } catch (error) { next(error); }
  }

  static async updateSurveyReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.updateSurveyReport(req.params.id, req.body, req.user!.userId);
      sendSuccess(res, 'Cập nhật khảo sát thành công', result);
    } catch (error) { next(error); }
  }

  static async submitSurveyReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.submitSurveyReport(req.params.id, req.user!.userId);
      sendSuccess(res, 'Đã nộp báo cáo khảo sát', result, 'MSG-SV-02');
    } catch (error) { next(error); }
  }

  // To preserve backwards compatibility with older routes if they exist
  static async createSurveyReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, ...data } = req.body;
      const result = await SurveyService.scheduleSurvey(orderId, data, req.user!.userId);
      sendSuccess(res, 'Tạo khảo sát thành công', result, 'CREATE_SUCCESS', 201);
    } catch (error) { next(error); }
  }

  static async getReportsByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SurveyService.getSurveysByOrder(req.params.orderId);
      sendSuccess(res, 'Lấy danh sách khảo sát thành công', result);
    } catch (error) { next(error); }
  }
}