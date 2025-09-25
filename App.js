// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';
import * as Font from "expo-font";

// Screens de autenticación
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import SplashScreen from './screens/SplashScreen';

// Screens de clientes
import Home from './screens/Home';
import ClientList from './screens/ClientList';
import ClientDetailScreen from './screens/ClientDetailScreen';
import CreateClientScreen from './screens/CreateClientScreen';

const Stack = createStackNavigator();

export default function App() {

const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        GreatVibes: require("./assets/Fonts/Great_Vibes/GreatVibes-Regular.ttf"),
        SansationRegular: require("./assets/Fonts/Sansation/Sansation-Light.ttf"),
        SansationBold: require("./assets/Fonts/Sansation/Sansation-Bold.ttf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);



  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'SplashScreen' : 'Login'}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="ClientList" component={ClientList} />
            <Stack.Screen name="ClientDetailScreen" component={ClientDetailScreen} />
            <Stack.Screen name="CreateClientScreen" component={CreateClientScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

