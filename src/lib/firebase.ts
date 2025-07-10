
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// To resolve the "5 NOT_FOUND" error, please ensure the following:
// 1. You have created a Firestore database in your Firebase project.
//    - Go to the Firebase Console: https://console.firebase.google.com/
//    - Select your project ("jexactylmc").
//    - In the left menu, go to "Build" > "Firestore Database".
//    - Click "Create database" and follow the setup steps.
//
// 2. Your Firestore security rules allow access.
//    - In the Firestore Database section of the console, go to the "Rules" tab.
//    - A basic set of rules has been added to `firestore.rules` in your project root.
//    - Copy the content of `firestore.rules` and paste it into the editor in the "Rules" tab, then click "Publish".

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebase() {
  if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('YOUR_')) {
    console.error("Firebase projectId is not set correctly. Please update your .env file.");
    return { app: null, db: null };
  }
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  return { app, db };
}

const { app, db } = initializeFirebase();

export { db };
