// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: 'YOUR_API_KEY',
//   authDomain: 'YOUR_AUTH_DOMAIN',
//   projectId: 'YOUR_PROJECT_ID',
//   storageBucket: 'YOUR_STORAGE_BUCKET',
//   messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
//   appId: 'YOUR_APP_ID',
//   measurementId: "YOUR_MEASUREMENT_ID"
// };

const firebaseConfig = {
  apiKey: "AIzaSyB3c4rDWrikS3_eq42ST4FPmin-t0vFINc",
  authDomain: "chatbuddy-01.firebaseapp.com",
  projectId: "chatbuddy-01",
  storageBucket: "chatbuddy-01.firebasestorage.app",
  messagingSenderId: "112691866718",
  appId: "1:112691866718:web:d070664965a19d947f18cf",
  measurementId: "G-F9D50XQS68"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { signInWithPopup, signOut };