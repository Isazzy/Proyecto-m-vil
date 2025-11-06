// src/config/firebaseConfig.js


import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  // setLogLevel, // opcional para debug
} from 'firebase/auth';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';



import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


// ⚠️ Reemplazá solo si corresponde. Para SDK v9, el bucket va con appspot.com
const firebaseConfig = {
  apiKey: "AIzaSyD4vl9Y8KJHAh6uGgv6U6N2JGkF0eXpRqQ",
  authDomain: "mobileapp-efd20.firebaseapp.com",
  projectId: "mobileapp-efd20",
  storageBucket: "mobileapp-efd20.appspot.com",
  messagingSenderId: "330520281855",
  appId: "1:330520281855:web:daca5f61f0127be22bc2ca",
  measurementId: "G-PTLCF2XTNE"
};

// Aseguramos una sola app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// RN: usar initializeAuth con persistencia. Web: getAuth normal.
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // Intentá inicializar Auth con persistencia (solo 1 vez).
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    // Si ya existía un Auth inicializado, usamos el existente
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };







     