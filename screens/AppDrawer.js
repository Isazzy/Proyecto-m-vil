import React from 'react';
// --- CAMBIO: Añadimos View, Text, StyleSheet ---
import { View, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

// Importa el diseño del Drawer
import CustomDrawer from './CustomDrawer';

// Importa las pantallas (o Stacks)
import Home from '../screens/Home';
import ProductosStack from './ProductosStack';
import Perfil from '../screens/Perfil'; // Importamos Perfil
import Productos from './Productos';

// --- PALETA DE COLORES (copiada de CustomDrawer) ---
const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#5B5BFB',
};

const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Ionicons name="construct-outline" size={50} color={COLORES.acentoPrincipal} />
    <Text style={styles.placeholderTitulo}>
      {route.params.screenName}
    </Text>
    <Text style={styles.placeholderSubtitulo}>
      (Pantalla en construcción)
    </Text>
  </View>
);

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORES.fondo,
          width: 260,
        },
        drawerActiveTintColor: COLORES.acentoPrincipal, 
        drawerInactiveTintColor: COLORES.textoSecundario, 
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 15,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={Home} 
        options={{
          drawerLabel: 'Inicio',
          drawerIcon: ({ color }) => (
            <Ionicons name="home-sharp" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Productos" 
        component={Productos} 
        options={{
          drawerLabel: 'Productos',
          drawerIcon: ({ color }) => (
            <Ionicons name="pricetags-sharp" size={22} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Agenda" 
        component={PlaceholderScreen} 
        initialParams={{ screenName: 'Agenda' }} 
        options={{
          drawerLabel: 'Agenda',
          drawerIcon: ({ color }) => (
            <Ionicons name="calendar-sharp" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Clientes" 
        component={PlaceholderScreen} 
        initialParams={{ screenName: 'Clientes' }}
        options={{
          drawerLabel: 'Clientes',
          drawerIcon: ({ color }) => (
            <Ionicons name="people-sharp" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Servicios" 
        component={PlaceholderScreen} 
        initialParams={{ screenName: 'Servicios' }}
        options={{
          drawerLabel: 'Servicios',
          drawerIcon: ({ color }) => (
            <Ionicons name="calculator-sharp" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Proveedores" 
        component={PlaceholderScreen} 
        initialParams={{ screenName: 'Proveedores' }}
        options={{
          drawerLabel: 'Proveedores',
          drawerIcon: ({ color }) => (
            <Ionicons name="person-add-sharp" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Ventas" 
        component={PlaceholderScreen} 
        initialParams={{ screenName: 'Ventas' }}
        options={{
          drawerLabel: 'Ventas',
          drawerIcon: ({ color }) => (
            <Ionicons name="cash-sharp" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen 
        name="Perfil" 
        component={Perfil} 
        options={{
          drawerItemStyle: { display: 'none' }
        }}
      />

    </Drawer.Navigator>
  );
}
const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondo,
  },
  placeholderTitulo: {
    color: COLORES.textoPrincipal,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },
  placeholderSubtitulo: {
    color: COLORES.textoSecundario,
    marginTop: 8,
  },
});