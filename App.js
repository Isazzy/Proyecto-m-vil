import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
<<<<<<< HEAD
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';  // View y Text son esenciales
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';
import * as Font from "expo-font";
import { RFValue } from 'react-native-responsive-fontsize';
       // En estilo: fontSize: RFValue(18),  // Escala basado en screen size
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
=======
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebaseConfig';
import * as Font from "expo-font";
>>>>>>> 80bf1161835ad63db583d93c0eb513b66f8a1875

// Screens
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Home from './screens/Home';
import SplashScreen from './screens/SplashScreen';
import ForgotPassword from './screens/ForgotPassword';
<<<<<<< HEAD
import home2 from './screens/home2';
=======
import Perfil from './screens/Perfil';
>>>>>>> 80bf1161835ad63db583d93c0eb513b66f8a1875

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
<<<<<<< HEAD
      <Stack.Navigator initialRouteName="Home">
=======
      
      <Stack.Navigator initialRouteName="SplashScreen" 
        screenOptions={{
          mode: 'modal',
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter
        }
        }>
>>>>>>> 80bf1161835ad63db583d93c0eb513b66f8a1875
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

<<<<<<< HEAD
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
=======
        <Stack.Screen name="Home" 
        component={Home} 
        options={{headerShown: false}}
        />
>>>>>>> 80bf1161835ad63db583d93c0eb513b66f8a1875
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

        
      </Stack.Navigator>

    </NavigationContainer>
  );
}


