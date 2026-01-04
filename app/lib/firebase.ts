// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuQ674TnOOkaR40HJPiaGgX-NNEk_swVA",
  authDomain: "regalo-nerea.firebaseapp.com",
  projectId: "regalo-nerea",
  storageBucket: "regalo-nerea.firebasestorage.app",
  messagingSenderId: "1010778104662",
  appId: "1:1010778104662:web:822f71ec7fec7da9bb6cf7",
  measurementId: "G-PHXQW86NJ8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);