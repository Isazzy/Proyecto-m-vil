import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD4vl9Y8KJHAh6uGgv6U6N2JGkF0eXpRqQ",
  authDomain: "mobileapp-efd20.firebaseapp.com",
  projectId: "mobileapp-efd20",
  storageBucket: "mobileapp-efd20.firebasestorage.app",
  messagingSenderId: "330520281855",
  appId: "1:330520281855:web:daca5f61f0127be22bc2ca",
  measurementId: "G-PTLCF2XTNE"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };

