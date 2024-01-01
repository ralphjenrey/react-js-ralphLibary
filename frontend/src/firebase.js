// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "Replace with your firebase database config",
  authDomain: "Replace with your firebase database config",
  projectId: "Replace with your firebase database config",
  storageBucket: "Replace with your firebase database config",
  messagingSenderId: "Replace with your firebase database config",
  appId: "Replace with your firebase database config",
  measurementId: "Replace with your firebase database config"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
