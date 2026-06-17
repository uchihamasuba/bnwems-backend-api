import { Request, Response, NextFunction } from 'express';
import { surveyService } from '../services/survey.service';

export const surveyController = {
  async scheduleSurvey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await surveyService.scheduleSurvey(req.body);
      res.status(201).json({ success: true, statusCode: 201, message: 'Đã xếp lịch khảo sát và thông báo đến Leader Staff thành công.' });
    } catch (err) { next(err); }
  },

  async submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await surveyService.submitSurveyReport(Number(req.params.id), req.body);
      res.status(200).json({ success: true, statusCode: 200, message: 'Nộp báo cáo khảo sát thực địa thành công (MSG-SV03).' });
    } catch (err) { next(err); }
  },
};
