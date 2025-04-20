// src/firebase.js
// Firebase initialization and auth exports
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Fill in your Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyCMSkViN2iPF1RvFtkDeNlUG8o68iXi2nc",

  authDomain: "dultra-83fa9.firebaseapp.com",

  projectId: "dultra-83fa9",

  storageBucket: "dultra-83fa9.firebasestorage.app",

  messagingSenderId: "38399061454",

  appId: "1:38399061454:web:c861a69c0dfd2309a28f9f",

  measurementId: "G-7GJ7P52HEK"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, googleProvider, db, storage };