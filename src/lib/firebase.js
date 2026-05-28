import { getAnalytics, isSupported } from 'firebase/analytics'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAXtzTKDpcov18wCDP5RdEYVMRSoldB0VE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'magnafic-3eddc.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'magnafic-3eddc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'magnafic-3eddc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1098083884888',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1098083884888:web:9293464bed2394e441cf2d',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-LM93XTJTZG',
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

let analytics = null

if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app)
    })
    .catch(() => {
      analytics = null
    })
}

export { app, auth, db, analytics }
