import { storage } from '../config/firebase';
import path from 'path';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/error.middleware';

export class EvidenceService {
  static async uploadAndSaveEvidence(
    file: Express.Multer.File,
    actionUserId: string,
    folder: string = 'general',
    description?: string,
    referenceType?: string,
    referenceId?: string,
  ) {
    if (!storage) {
      throw new Error('Firebase Storage chưa được khởi tạo.');
    }

    const bucket = storage.bucket();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = `${uniqueSuffix}${path.extname(file.originalname)}`;

    // Create the file reference in the specified folder
    const fileRef = bucket.file(`${folder}/${fileName}`);

    // Upload the file buffer
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    try {
      await fileRef.makePublic();
    } catch (err) {
      console.warn('Could not make file public.');
    }

    const encodedFilePath = encodeURIComponent(`${folder}/${fileName}`);
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFilePath}?alt=media`;

    const evidence = await prisma.evidence.create({
      data: {
        fileUrl,
        description,
        uploadedBy: BigInt(actionUserId),
      },
    });

    return evidence;
  }

  static async getEvidenceById(id: string) {
    const evidence = await prisma.evidence.findUnique({
      where: { evidenceId: BigInt(id) },
    });
    if (!evidence) {
      throw new AppError('Không tìm thấy chứng từ.', 404);
    }
    return evidence;
  }
}
