import { Request, Response, NextFunction } from 'express';
import { EvidenceService } from '../services/evidence.service';
import { BigIntUtils } from '../utils/bigint.util';

export const evidenceController = {
  async uploadEvidence(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          code: 'MSG-UF-01',
          message: 'Không có tệp được cung cấp hoặc tệp trống.',
        });
      }

      if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('application/pdf')) {
        return res.status(400).json({
          success: false,
          code: 'MSG-UF-02',
          message: 'Định dạng tệp không được hỗ trợ.',
        });
      }

      const userId = (req as any).user!.userId;
      const { folder, description, referenceType, referenceId } = req.body;

      const evidence = await EvidenceService.uploadAndSaveEvidence(
        file,
        userId,
        folder || 'general',
        description,
        referenceType,
        referenceId,
      );

      res.status(201).json({
        success: true,
        code: 'MSG-UF-01', // According to docs this is the success code somehow? Or maybe MSG-UF-00? Wait, the doc says "code": "MSG-UF-01" in the response example. I will use it.
        message: 'Tải ảnh và lưu chứng từ thành công.',
        data: BigIntUtils.toJSON(evidence),
      });
    } catch (error: any) {
      next(error);
    }
  },

  async getEvidenceById(req: Request, res: Response, next: NextFunction) {
    try {
      const evidence = await EvidenceService.getEvidenceById(req.params.id);
      res.status(200).json({
        success: true,
        code: 'MSG-UF-02',
        data: BigIntUtils.toJSON(evidence),
      });
    } catch (error) {
      next(error);
    }
  },
};
