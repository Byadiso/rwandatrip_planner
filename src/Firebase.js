import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAy9uBaiD3l-8TAsaKOv6WjZcXsXxtU5ps",
  authDomain: "plan-your-trip-to-rwanda.firebaseapp.com",
  projectId: "plan-your-trip-to-rwanda",
  storageBucket: "plan-your-trip-to-rwanda.firebasestorage.app",
  messagingSenderId: "335516297558",
  appId: "1:335516297558:web:68a136c92ae1504c298ef7",
  measurementId: "G-MLYLB47EXF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
