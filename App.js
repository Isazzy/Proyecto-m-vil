import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './screens/Login';
import SignUp from './screens/SignUp';
import SplashScreen from "./screens/SplashScreen"
import Perfil from './screens/EditarPerfil'; 
import AppDrawer from './screens/AppDrawer';
import EditarPerfil from './screens/EditarPerfil';
import ForgotPassword from './screens/ForgotPassword';
import AgregarProducto from './screens/AgregarProducto'
import EditarProducto from './screens/EditarProducto'
import VerProducto from './screens/VerProducto'

import { useFonts } from 'expo-font';


const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'GreatVibes': require('./assets/Fonts/Great_Vibes/GreatVibes-Regular.ttf'), 
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, 
        }}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
        />
        <Stack.Screen 
          name="Login" 
          component={Login} 
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUp} 
        />
        <Stack.Screen 
          name="EditarPerfil"
          component={EditarPerfil} 
        />
        <Stack.Screen 
          name="ForgotPassword"
          component={ForgotPassword} 
        />
        <Stack.Screen 
          name="AgregarProducto"
          component={AgregarProducto} 
        />
        <Stack.Screen 
          name="VerProducto"
          component={VerProducto} 
        />
        <Stack.Screen 
          name="EditarProducto"
          component={EditarProducto} 
        />
        <Stack.Screen 
          name="MainApp" 
          component={AppDrawer} 
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

