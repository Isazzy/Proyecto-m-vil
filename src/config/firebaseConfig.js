     // src/config/firebaseConfig.js
     import { initializeApp } from 'firebase/app';
     import { getAuth } from 'firebase/auth';  // Importa getAuth para crear la instancia

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

     // Inicializa la app de Firebase
     const app = initializeApp(firebaseConfig);

     // Crea y exporta la instancia de Auth (¡esto define 'auth'!)
     export const auth = getAuth(app);

     // Opcional: Exporta la app para otros módulos (Firestore, etc.)
     export default app;

     // Agrega esto para debug: Verifica que auth esté definido
     console.log('Firebase inicializado correctamente. Auth:', auth ? 'OK' : 'ERROR');
     