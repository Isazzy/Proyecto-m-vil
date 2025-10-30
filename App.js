// App.js
import React, { useEffect, useState } from 'react';
import { Dimensions, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';
import * as Font from 'expo-font';

// Screens
import Perfil from './screens/Perfil';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import SplashScreen from './screens/SplashScreen.js';
import ForgotPassword from './screens/ForgotPassword';
import EditarPerfil from './screens/EditarPerfil';
import ChangePasswordForm from './screens/ChangePasswordForm';
import Productos from './screens/Productos';
import DrawerNavigator from './screens/DrawerNavigator';
import AgregarProducto from './screens/AgregarProducto';
import EditarProducto from './screens/EditarProducto';
import VerProducto from './screens/VerProducto';

const Stack = createStackNavigator();
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Carga de fuentes
  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        GreatVibes: require('./assets/Fonts/Great_Vibes/GreatVibes-Regular.ttf'),
        SansationRegular: require('./assets/Fonts/Sansation/Sansation-Light.ttf'),
        SansationBold: require('./assets/Fonts/Sansation/Sansation-Bold.ttf'),
      });
      setFontsLoaded(true);
    })();
  }, []);

  // Estado de Auth (persistente)
  useEffect(() => {
    if (!auth) {
      console.error('Firebase Auth no está inicializado');
      setAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state =>', currentUser ? currentUser.email : 'signed out');
      setUser(currentUser || null);
      setAuthReady(true);



    });

    // ⚠️ devolver la función, NO llamarla
    return unsubscribe;
  }, []);

  // Pantalla de carga mientras esperan fuentes + auth
  if (!fontsLoaded || !authReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        // Stack PRIVADO (usuario autenticado)
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="EditarPerfil" component={EditarPerfil} />
          <Stack.Screen name="ChangePasswordForm" component={ChangePasswordForm} />
          <Stack.Screen name="Productos" component={Productos} />
          <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
          <Stack.Screen name="AgregarProducto" component={AgregarProducto} />
          <Stack.Screen name="EditarProducto" component={EditarProducto} />
          <Stack.Screen name="VerProducto" component={VerProducto} />
        </Stack.Navigator>
      ) : (
        // Stack PÚBLICO (sin sesión)
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

