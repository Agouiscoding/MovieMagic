// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Replace these values with your Firebase web app config
// You can keep placeholders with Vite envs and load from import.meta.env if preferred
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Persist session across tabs and reloads
setPersistence(auth, browserLocalPersistence);

export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

