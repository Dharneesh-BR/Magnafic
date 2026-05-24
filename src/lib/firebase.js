// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXtzTKDpcov18wCDP5RdEYVMRSoldB0VE",
  authDomain: "magnafic-3eddc.firebaseapp.com",
  projectId: "magnafic-3eddc",
  storageBucket: "magnafic-3eddc.firebasestorage.app",
  messagingSenderId: "1098083884888",
  appId: "1:1098083884888:web:9293464bed2394e441cf2d",
  measurementId: "G-LM93XTJTZG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
