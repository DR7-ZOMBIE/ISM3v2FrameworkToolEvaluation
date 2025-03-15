import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc, deleteDoc, onSnapshot, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";  // Importa Firebase Analytics

// Tu configuración de Firebase (proporcionada por Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAsByeJkbV-jqf8fOuoxM60tc0NiXg6OzA",
  authDomain: "ism3-v2-herramienta-aut.firebaseapp.com",
  projectId: "ism3-v2-herramienta-aut",
  storageBucket: "ism3-v2-herramienta-aut.firebasestorage.app",
  messagingSenderId: "752733857414",
  appId: "1:752733857414:web:94191abbebc8253ea5d307",
  measurementId: "G-GB8P1PNXRR"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Inicializa Firebase Analytics
const analytics = getAnalytics(app);

export { db, collection, getDocs, setDoc, doc, updateDoc, deleteDoc, onSnapshot, addDoc, auth, analytics };
