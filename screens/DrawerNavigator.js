// navigation/DrawerNavigator.js
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/Home';
import Perfil from '../screens/Perfil';
import Productos from '../screens/Productos';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation }) {
  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const menuItems = [
    { label: 'Inicio', icon: 'home-outline', screen: 'Home' },
    { label: 'Perfil', icon: 'person-outline', screen: 'Perfil' },
    { label: 'Agenda', icon: 'calendar-outline', screen: 'Agenda' },
    { label: 'Clientes', icon: 'people-outline', screen: 'Clientes' },
    { label: 'Servicios', icon: 'cut-outline', screen: 'Servicios' },
    { label: 'Proveedores', icon: 'briefcase-outline', screen: 'Proveedores' },
    { label: 'Compras', icon: 'cart-outline', screen: 'Compras' },
  ];

  return (
    <View style={styles.drawerContainer}>
      <View style={{ flex: 1 }}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={styles.drawerItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={22} color="#ff5b5b" />
            <Text style={styles.drawerText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Cerrar sesión */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={[styles.drawerText, { color: '#fff' }]}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: '#121212' },
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Perfil" component={Perfil} />
      <Drawer.Screen name="Productos" component={Productos} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, padding: 20, backgroundColor: '#121212' },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#2a2a2a',
    borderBottomWidth: 1,
  },
  drawerText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopColor: '#2a2a2a',
    borderTopWidth: 1,
  },
});
