// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDVtm5SCNv1YurlyQ7A1IMyRHYu26OZ4kk",
  authDomain: "project-chat-d6cb6.firebaseapp.com",
  projectId: "project-chat-d6cb6",
  storageBucket: "project-chat-d6cb6.appspot.com",
  messagingSenderId: "86067174660",
  appId: "1:86067174660:web:f2176abab909acd6584451",
  measurementId: "G-R6NXN292P0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;