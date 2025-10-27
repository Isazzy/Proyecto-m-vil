import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';
import * as Font from "expo-font";

// Screens
import Perfil from './screens/Perfil'; // ajustá la ruta según tu estructura

import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import SplashScreen from './screens/SplashScreen';
import ForgotPassword from './screens/ForgotPassword';
import EditarPerfil from './screens/EditarPerfil';
import ChangePasswordForm from './screens/ChangePasswordForm';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      
      <Stack.Navigator initialRouteName="SplashScreen" 
        screenOptions={{
          mode: 'modal',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter
        }
        }>
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp}
          options={{
            headerTransparent: true,       
            headerTitle: "",                
            headerTintColor: "#fff",
          }} 
        />

        <Stack.Screen name="Home" 
        component={Home} 
        options={{headerShown: false,
        }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPassword}
          options={{
            headerTransparent: true,       
            headerTitle: "",                
            headerTintColor: "#fff",
          }} 
        />
        <Stack.Screen 
        name='Perfil'
        component={Perfil}
        options={{headerShown: false}}
        />
        <Stack.Screen 
        name='EditarPerfil'
        component={EditarPerfil}
        options={{headerShown: false}}
        />

          <Stack.Screen 
        name='ChangePasswordForm'
        component={ChangePasswordForm}
        options={{headerShown: false}}
        />
        
      </Stack.Navigator>

    </NavigationContainer>
  );
}


// App.js
