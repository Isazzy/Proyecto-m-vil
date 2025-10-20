import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Animated,
  Easing,
  ActionSheetIOS,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';

const PROFILE_MENU_MAX_WIDTH = 320;

export default function Home({ navigation }) {

  const handleLogOut = async () => {
    try {
      await signOut(auth);  
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
      navigation.replace('Login');  
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Bienvenido a la aplicación</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#922b21',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  markAll: { color: '#97c5df', fontSize: 12, fontWeight: '600' },

  notifItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a2a',
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff3b30', marginRight: 8 },
  notifItemTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  notifItemBody: { color: '#ddd', fontSize: 12, marginTop: 2 },
  notifTime: { color: '#aaa', fontSize: 11, marginTop: 6, textAlign: 'right' },
});

