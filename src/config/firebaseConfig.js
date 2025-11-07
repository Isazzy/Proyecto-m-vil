// src/config/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyD4vl9Y8KJHAh6uGgv6U6N2JGkF0eXpRqQ",
  authDomain: "mobileapp-efd20.firebaseapp.com",
  projectId: "mobileapp-efd20",
  storageBucket: "mobileapp-efd20.appspot.com",
  messagingSenderId: "330520281855",
  appId: "1:330520281855:web:daca5f61f0127be22bc2ca",
  measurementId: "G-PTLCF2XTNE"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getApps().length === 0
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);


const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };






