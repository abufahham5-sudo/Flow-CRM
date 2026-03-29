import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmH1y4dR_jzr7zmgXMCT119LlxzVmcKao",
  authDomain: "abu-crm.firebaseapp.com",
  projectId: "abu-crm",
  storageBucket: "abu-crm.firebasestorage.app",
  messagingSenderId: "692336646499",
  appId: "1:692336646499:web:d20b731de469885dfbdb56"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
