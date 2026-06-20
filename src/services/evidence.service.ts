import prisma from '../config/database';

export class EvidenceService {
  static async createEvidenceFile(fileData: any, userId: string) {
    const { filename, mimetype, size } = fileData;
    const fileUrl = `http://localhost:3000/uploads/${filename}`; // In production, this should be the real domain

    return prisma.evidenceFile.create({
      data: {
        fileName: filename,
        fileUrl: fileUrl,
        fileType: mimetype,
        fileSize: BigInt(size),
        uploadedBy: BigInt(userId)
      }
    });
  }
}
