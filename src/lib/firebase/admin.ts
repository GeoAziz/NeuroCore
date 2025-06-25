import admin from 'firebase-admin';
// The 'json' extension is automatically resolved by Next.js/TypeScript
// when 'resolveJsonModule' is true in tsconfig.json.
import serviceAccount from '../../../serviceAccountKey.json';

// This prevents initialization on every hot-reload in development
if (!admin.apps.length) {
  try {
    admin.initializeApp({
        // The type assertion is needed because TypeScript can't infer the
        // precise structure of the imported JSON file.
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
    throw new Error("Could not initialize Firebase Admin SDK. Make sure serviceAccountKey.json is present in the project root and correctly formatted.");
  }
}

const firestore = admin.firestore();
const auth = admin.auth();

export { firestore, auth };
