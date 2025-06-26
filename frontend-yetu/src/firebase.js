import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Remplace ces valeurs par les vraies de ton projet Firebase (console Firebase -> Project settings)
const firebaseConfig = {
    apiKey: "AIzaSyBNGZ1bjokqjwObjZew9e9iNAWJfjTQK-U",
    authDomain: "yetu-courrier.firebaseapp.com",
    projectId: "yetu-courrier",
    storageBucket: "yetu-courrier.firebasestorage.app",
    messagingSenderId: "457866525101",
    appId: "1:457866525101:web:b3aa666ebea7f057aac924"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Exporter auth et db
export const auth = getAuth(app);
export const db = getFirestore(app);
