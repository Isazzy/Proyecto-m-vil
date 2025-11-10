import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient'; // <-- para degradado

const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
};

const CustomDrawer = ({ navigation, state }) => {
  const [user] = useAuthState(auth);

  const displayName = user?.displayName?.trim() || 'Usuario';

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const drawerItems = state.routes.map((route) => {
    const iconsMap = {
      Home: 'home-outline',
      Perfil: 'person-outline',
      Productos: 'pricetags-outline',
      Agenda: 'calendar-outline',
      Clientes: 'people-outline',
      Servicios: 'cut-outline',
      Proveedores: 'briefcase-outline',
      Compras: 'cart-outline',
    };

    return {
      key: route.key,
      label: route.name,
      icon: iconsMap[route.name] || 'ellipse-outline',
      screen: route.name,
    };
  });

  return (
    <View style={styles.container}>
      <DrawerContentScrollView contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={28} color={COLORES.textoPrincipal} />
            )}
          </View>
          <Text style={styles.headerNombre}>{displayName}</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </View>

        {/* Items */}
        <View style={styles.itemContainer}>
          {drawerItems.map((item) => (
            <Pressable
              key={item.key}
              style={styles.drawerItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={22} color="#ff5b5b" />
              <Text style={styles.drawerText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Logout con degradado */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.logoutButton]}
        >
          <LinearGradient
            colors={['#FB5B5B', '#FF7B5B']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.gradientBackground}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORES.fondo },
  header: {
    padding: 20,
    backgroundColor: COLORES.superficie,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.acentoPrincipal,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORES.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  headerNombre: { color: COLORES.textoPrincipal, fontSize: 18, fontWeight: 'bold' },
  headerEmail: { color: COLORES.textoSecundario, fontSize: 14 },
  itemContainer: { paddingTop: 10 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#2a2a2a',
    borderBottomWidth: 1,
  },
  drawerText: { color: '#fff', fontSize: 16, marginLeft: 12, fontWeight: '500' },
  footer: { borderTopWidth: 1, borderTopColor: COLORES.superficie, padding: 20, marginBottom: 15 },
  logoutButton: { borderRadius: 12, overflow: 'hidden' },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  logoutText: { marginLeft: 10, color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default CustomDrawer;
