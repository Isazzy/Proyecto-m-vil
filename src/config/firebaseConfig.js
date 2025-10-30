// src/config/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

     // Tu configuración de Firebase (reemplaza con la tuya real)
     // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
      apiKey: "AIzaSyD4vl9Y8KJHAh6uGgv6U6N2JGkF0eXpRqQ",
      authDomain: "mobileapp-efd20.firebaseapp.com",
      projectId: "mobileapp-efd20",
      storageBucket: "mobileapp-efd20.firebasestorage.app",
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






     // Agrega esto para debug: Verifica que auth esté definido
     console.log('Firebase inicializado correctamente. Auth:', auth ? 'OK' : 'ERROR');
     