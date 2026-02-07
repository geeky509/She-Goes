
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAqAj39TA81dkZSbNvoeGN9bT8GAtYEDC0",
  authDomain: "she-goes-61c9f.firebaseapp.com",
  projectId: "she-goes-61c9f",
  storageBucket: "she-goes-61c9f.firebasestorage.app",
  messagingSenderId: "966702113719",
  appId: "1:966702113719:web:2265ae12f3f7c8dcf9fe32",
  measurementId: "G-Y2KXEDLNNL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
