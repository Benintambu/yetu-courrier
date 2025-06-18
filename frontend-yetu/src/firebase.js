// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNGZ1bjokqjwObjZew9e9iNAWJfjTQK-U",
    authDomain: "yetu-courrier.firebaseapp.com",
    projectId: "yetu-courrier",
    appId: "1:457866525101:web:b3aa666ebea7f057aac924"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
