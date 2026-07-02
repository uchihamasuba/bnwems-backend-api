import { storage } from '../config/firebase';
import path from 'path';

export class UploadService {
  /**
   * Uploads an image file to Firebase Storage and returns metadata including the public URL.
   * @param file The multer file object
   * @param folder The target folder name in Firebase Storage
   */
  static async uploadImageToFirebase(file: Express.Multer.File, folder: string = 'general') {
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

    // Make the file publicly accessible (optional, but typical for avatars/images)
    try {
      await fileRef.makePublic();
    } catch (err) {
      console.warn('Could not make file public. It may already be public or bucket policies prevent it.');
    }

    // Construct the public URL
    const encodedFilePath = encodeURIComponent(`${folder}/${fileName}`);
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedFilePath}?alt=media`;

    return {
      url: publicUrl,
      fileName,
      folder,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
