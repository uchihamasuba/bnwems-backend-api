import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { env } from './env';

// Initialize Firebase only if the required env vars are present
if (
  env.FIREBASE_PROJECT_ID &&
  env.FIREBASE_CLIENT_EMAIL &&
  env.FIREBASE_PRIVATE_KEY &&
  env.FIREBASE_STORAGE_BUCKET
) {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          // Handle escaped newlines in the private key
          privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: env.FIREBASE_STORAGE_BUCKET,
      });
      console.log('✅ Firebase Admin SDK initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase configuration is incomplete. Uploads to Firebase will not work.');
}

export const storage = getApps().length > 0 ? getStorage() : null;
