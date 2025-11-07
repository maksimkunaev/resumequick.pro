// firebaseInit.js - Firebase initialization
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore/lite";
import { getAuth } from "firebase/auth";

// Firebase configuration from environment variables
// These must be prefixed with REACT_APP_ to be accessible in the browser
const firebaseConfig = {
  apiKey: "AIzaSyCEQl9oAmeMvjzOfdcjCcmswJUHYKtm1Lg",
  authDomain: "resumequick-eae3e.firebaseapp.com",
  projectId: "resumequick-eae3e",
  storageBucket: "resumequick-eae3e.firebasestorage.app",
  messagingSenderId: "156781294268",
  appId: "1:156781294268:web:67be0ed5111583716ad6b9",
  measurementId: "G-B4D6R9Q15Z"
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase configuration is missing. Please set REACT_APP_FIREBASE_* environment variables."
  );
}

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);