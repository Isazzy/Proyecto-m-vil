import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Importa tus pantallas ---
import HomeScreen from '../screens/Home'; // ¡Tu dashboard funcional!
import ProductosScreen from '../screens/Productos'; // Tu pantalla de lista de productos
import PlaceholderScreen from '../screens/PlaceholderScreen'; // Una pantalla genérica

const Tab = createBottomTabNavigator();

// Nombres de iconos para cada pestaña
const tabIcons = {
  Inicio: 'home',
  Productos: 'package-variant-closed',
  Agenda: 'calendar-month',
  Clientes: 'account-group',
  Ventas: 'point-of-sale', // Nuevo
  Proveedores: 'truck-delivery',
  Compras: 'cart',
};

export default function AppTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio" // ¡Aquí defines que "Inicio" es la pestaña activa!
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = tabIcons[route.name] || 'alert-circle';
          // Ajusta el ícono si está 'focused'
          const finalIconName = focused ? iconName : `${iconName}-outline`;
          
          // 'home' no tiene versión '-outline' en MCI, así que hacemos una excepción
          if (route.name === 'Inicio') {
            return <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          }
          
          return <MaterialCommunityIcons name={finalIconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#97c5df', // Color azul para la pestaña activa
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Ocultamos el header del Tab, porque Home.js ya tiene el suyo
        tabBarStyle: {
          backgroundColor: '#1c1c1e', // Color de fondo de la barra
          borderTopColor: '#2a2a2a',   // Línea superior
        },
      })}
    >
      {/* --- Tus 7 Pestañas --- */}
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Productos" component={ProductosScreen} />
      
      {/* Usamos 'PlaceholderScreen' para las pantallas que aún no están listas */}
      <Tab.Screen name="Agenda" component={PlaceholderScreen} />
      <Tab.Screen name="Clientes" component={PlaceholderScreen} />
      <Tab.Screen name="Ventas" component={PlaceholderScreen} />
      <Tab.Screen name="Proveedores" component={PlaceholderScreen} />
      <Tab.Screen name="Compras" component={PlaceholderScreen} />
      
    </Tab.Navigator>
  );
}