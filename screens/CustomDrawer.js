//screens/CustomDrawer.js

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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
            props.navigation.replace('Login'); 
          } catch (e) {
            Alert.alert('Error', e?.message ?? 'Intenta nuevamente.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Gradiente de fondo decorativo */}
      <LinearGradient
        colors={['rgba(251, 91, 91, 0.08)', 'transparent', 'rgba(91, 91, 251, 0.05)']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* 1. Header del Drawer con diseño mejorado */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['rgba(251, 91, 91, 0.15)', 'rgba(25, 1, 1, 0.9)']}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Patrón decorativo */}
            <View style={styles.decorativePattern}>
              <View style={styles.circle1} />
              <View style={styles.circle2} />
            </View>

            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#FB5B5B', '#f6416c', '#5B5BFB']}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarWrap}>
                  {user?.photoURL ? (
                    <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={32} color={COLORES.textoPrincipal} />
                    </View>
                  )}
                </View>
              </LinearGradient>
              {/* Indicador de estado online */}
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.headerNombre}>{displayName}</Text>
              <View style={styles.emailBadge}>
                <Ionicons name="mail" size={12} color="#FB5B5B" style={styles.emailIcon} />
                <Text style={styles.headerEmail} numberOfLines={1}>{user?.email}</Text>
              </View>
            </View>

            {/* Línea decorativa inferior */}
            <View style={styles.headerBottomLine} />
          </LinearGradient>
        </View>

        {/* 2. Items de Navegación con espaciado mejorado */}
        <View style={styles.itemContainer}>
          <View style={styles.menuLabel}>
            <View style={styles.menuLabelLine} />
            <Text style={styles.menuLabelText}>MENÚ</Text>
            <View style={styles.menuLabelLine} />
          </View>
          <DrawerItemList {...props} />
        </View>

        {/* Espacio decorativo con gradiente */}
        <View style={styles.decorativeSection}>
          <LinearGradient
            colors={['rgba(251, 91, 91, 0.1)', 'rgba(91, 91, 251, 0.1)']}
            style={styles.decorativeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="sparkles" size={24} color="#FB5B5B" />
            <Text style={styles.decorativeText}>Bienvenido</Text>
          </LinearGradient>
        </View>
      </DrawerContentScrollView>

      {/* 3. Footer mejorado con gradiente */}
      <View style={styles.footerContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(25, 1, 1, 0.8)']}
          style={styles.footerGradient}
        >
          <View style={styles.footer}>
            <Pressable 
              onPress={handleLogout} 
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed
              ]}
            >
              <View style={styles.logoutIconContainer}>
                <Ionicons name="log-out-outline" size={20} color="#FB5B5B" />
              </View>
              <View style={styles.logoutTextContainer}>
                <Text style={styles.logoutText}>Cerrar Sesión</Text>
                <Text style={styles.logoutSubtext}>Hasta pronto</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORES.textoSecundario} />
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  circle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 91, 91, 0.1)',
  },
  circle2: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(91, 91, 251, 0.1)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  avatarGradient: {
    padding: 3,
    borderRadius: 45,
    shadowColor: '#FB5B5B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 42,
    backgroundColor: COLORES.fondo,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(251, 91, 91, 0.1)',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: '35%',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORES.fondo,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORES.fondo,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ade80',
  },
  userInfo: {
    alignItems: 'center',
  },
  headerNombre: {
    color: COLORES.textoPrincipal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 91, 91, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 91, 91, 0.2)',
  },
  emailIcon: {
    marginRight: 6,
  },
  headerEmail: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    fontWeight: '500',
  },
  headerBottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(251, 91, 91, 0.3)',
  },
  itemContainer: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  menuLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  menuLabelLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(251, 91, 91, 0.2)',
  },
  menuLabelText: {
    color: COLORES.textoSecundario,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginHorizontal: 12,
  },
  decorativeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  decorativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 91, 91, 0.2)',
  },
  decorativeText: {
    color: COLORES.textoPrincipal,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footerContainer: {
    marginBottom: 0,
  },
  footerGradient: {
    paddingTop: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(251, 91, 91, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 1, 1, 0.6)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 91, 91, 0.2)',
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(251, 91, 91, 0.1)',
    transform: [{ scale: 0.98 }],
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(251, 91, 91, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutText: {
    color: COLORES.textoPrincipal,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  logoutSubtext: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    fontWeight: '400',
  },
});

export default CustomDrawer;