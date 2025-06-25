import admin from 'firebase-admin';

// This prevents initialization on every hot-reload in development
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  
  if (!serviceAccountJson) {
    throw new Error('Firebase service account credentials are not set in environment variables. Please set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64.');
  }
  
  try {
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountJson, 'base64').toString('utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error("Failed to parse or initialize Firebase Admin SDK:", error.message);
    throw new Error("Could not initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is likely malformed or missing.");
  }
}

const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };
