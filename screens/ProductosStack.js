import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';

// Tu paleta de colores
const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#5B5BFB',
};

const CustomDrawer = (props) => {
  const [user] = useAuthState(auth);
  
  const displayName =
    (user?.displayName && user.displayName.trim()) || 'Usuario';

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            // Esto te saca del Drawer y te manda al Stack de Login
            props.navigation.replace('Auth'); 
          } catch (e) {
            Alert.alert('Error', e?.message ?? 'Intenta nuevamente.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* 1. Header del Drawer */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={24} color={COLORES.textoPrincipal} />
            )}
          </View>
          <Text style={styles.headerNombre}>{displayName}</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </View>

        {/* 2. Items de Navegación (Home, Productos) */}
        <View style={styles.itemContainer}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* 3. Footer (Cerrar Sesión) */}
      <View style={styles.footer}>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color={COLORES.textoSecundario} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo, // Fondo negro
  },
  header: {
    padding: 20,
    backgroundColor: COLORES.superficie, // "Casi negro"
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
  headerNombre: {
    color: COLORES.textoPrincipal,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerEmail: {
    color: COLORES.textoSecundario,
    fontSize: 14,
  },
  itemContainer: {
    paddingTop: 10,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORES.superficie,
    padding: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 10,
    color: COLORES.textoSecundario,
    fontSize: 15,
  },
});

export default CustomDrawer;