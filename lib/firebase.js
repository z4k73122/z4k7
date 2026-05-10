// lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAz4o32zfRvO-pLUpzWtYD2apOWufPxzzs",
  authDomain: "z4k7-traffic.firebaseapp.com",
  projectId: "z4k7-traffic",
  storageBucket: "z4k7-traffic.firebasestorage.app",
  messagingSenderId: "31540063872",
  appId: "1:31540063872:web:ed8ff46b4dcdc321b2c065",
  measurementId: "G-V83LDWVX79",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Analytics (opcional)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { db, collection, addDoc, query, where, getDocs, deleteDoc, doc };
