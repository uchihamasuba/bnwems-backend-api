import { Request, Response, NextFunction } from 'express';
import { EvidenceService } from '../services/evidence.service';

export class EvidenceController {
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const userId = (req as any).user.userId;
      const evidence = await EvidenceService.createEvidenceFile(req.file, userId);

      // Serialize BigInt
      const serializedEvidence = {
        ...evidence,
        id: Number(evidence.id),
        fileSize: Number(evidence.fileSize),
        uploadedBy: Number(evidence.uploadedBy)
      };

      res.status(201).json({
        success: true,
        data: serializedEvidence
      });
    } catch (error) {
      next(error);
    }
  }
}
