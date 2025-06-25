import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- Firebase Configuration ---
// For a real production app, these values should be loaded from
// environment variables to keep them secure. They are hardcoded here
// to resolve a persistent environment loading issue in this development tool.
const firebaseConfig = {
  apiKey: "AIzaSyCics48vPikLgXUObrHdMUNzDyE8AkeENI",
  authDomain: "neurocare-74c69.firebaseapp.com",
  projectId: "neurocare-74c69",
  storageBucket: "neurocare-74c69.firebasestorage.app",
  messagingSenderId: "188259580834",
  appId: "1:188259580834:web:a69727476365319caf50fb",
  measurementId: "G-QVQB7H4N15"
};


// This check prevents re-initialization on every hot-reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
