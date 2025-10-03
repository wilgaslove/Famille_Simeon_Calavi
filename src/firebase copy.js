// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import  { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD0ubmpA7J5RA_BG0krb0dez57RUUajKCc",
  authDomain: "famille-simeon-calavi.firebaseapp.com",
  projectId: "famille-simeon-calavi",
  storageBucket: "famille-simeon-calavi.firebasestorage.app",
  messagingSenderId: "910547713559",
  appId: "1:910547713559:web:b6b712159fafcbb43aa652"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const messaging = getMessaging(app);
