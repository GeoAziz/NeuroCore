import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!serviceAccountJson) {
    throw new Error('Firebase service account is not set in environment variables.');
  }
  
  try {
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountJson, 'base64').toString('utf-8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error("Failed to parse or initialize Firebase Admin SDK:", error);
    throw new Error("Could not initialize Firebase Admin SDK. Check your FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 environment variable.");
  }
}

const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };
