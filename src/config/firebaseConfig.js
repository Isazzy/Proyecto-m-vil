// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD4vl9Y8KJHAh6uGgv6U6N2JGkF0eXpRqQ",
  authDomain: "mobileapp-efd20.firebaseapp.com",
  projectId: "mobileapp-efd20",
  storageBucket: "mobileapp-efd20.firebasestorage.app",
  messagingSenderId: "330520281855",
  appId: "1:330520281855:web:daca5f61f0127be22bc2ca",
  measurementId: "G-PTLCF2XTNE"
};

// Inicializar app Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth con persistencia
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore
const firestore = getFirestore(app);

export { auth, firestore };
