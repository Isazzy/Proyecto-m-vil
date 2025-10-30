import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';  // Agrega esta línea
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
// Obtén el tamaño de la pantalla (se actualiza en orientación changes)
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);

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
    if (!auth) {
             console.error('Firebase Auth no está inicializado');
             setLoading(false);
             return;
           }
           const unsubscribe = onAuthStateChanged(auth, (currentUser ) => {
             console.log('Estado de auth cambiado:', currentUser );
             setUser (currentUser );
             setLoading(false);  // Una vez cargado, desactiva loading
           });

    
    return unsubscribe();
  }, []);

  

  return (
    <NavigationContainer>
      
      <Stack.Navigator initialRouteName="Perfil" 
        screenOptions={{
          mode: 'modal',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter
        }
        }>
        <Stack.Screen
          name="Home"
          component={Home}
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
        
        <Stack.Screen name="Productos" component={Productos} options={{ headerShown: false }} />

        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AgregarProducto" component={AgregarProducto} />
        <Stack.Screen name="EditarProducto" component={EditarProducto} />
        <Stack.Screen name="VerProducto" component={VerProducto} />

      </Stack.Navigator>
        


    </NavigationContainer>
  );
}


// App.js
