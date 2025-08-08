
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBIFfdmO0M_qIHBQe_04eZryb52Jrjh-rk",
  authDomain: "firestorm-team-4.firebaseapp.com",
  projectId: "firestorm-team-4",
  storageBucket: "firestorm-team-4.firebasestorage.app",
  messagingSenderId: "585910122303",
  appId: "1:585910122303:web:fdae3ccebeaf0b011d858a",
  measurementId: "G-6X9R8HBD90"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
