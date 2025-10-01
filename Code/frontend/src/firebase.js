import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0cbBppN9YBv-WzFKbN6wUu-HsXh_tiCc",
  authDomain: "auditron-8ad44.firebaseapp.com",
  projectId: "auditron-8ad44",
  storageBucket: "auditron-8ad44.firebasestorage.app",
  messagingSenderId: "486633794732",
  appId: "1:486633794732:web:a17bc63e7c1cd9b2f90309",
  measurementId: "G-BXYZHDEXD0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;