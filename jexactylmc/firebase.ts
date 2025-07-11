
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkyo_fL5xwL0PlReBsvRUeF-tshIiuSvc",
  authDomain: "jexactylmc.firebaseapp.com",
  projectId: "jexactylmc",
  storageBucket: "jexactylmc.firebasestorage.app",
  messagingSenderId: "749076725662",
  appId: "1:749076725662:web:18f13d31592d7834a0a08f"
};

function initializeFirebase() {
  const projectId = firebaseConfig.projectId;
  if (!projectId || projectId.includes('YOUR_')) {
    console.error("Firebase projectId is not set correctly.");
    return { app: null, db: null };
  }
  
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  return { app, db };
}

const { app, db } = initializeFirebase();

export { db };
