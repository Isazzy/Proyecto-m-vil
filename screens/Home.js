import React, { useMemo, useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function Home({ navigation }) {
  const [user, loading, error] = useAuthState(auth);
  const { width: screenWidth } = useWindowDimensions();

  // Cards del cuerpo
  const items = useMemo(
    () => [
      { id: '1', icon: 'pricetags-sharp', titulo: 'Productos', texto: 'Gestiona todos los productos', screen: 'Productos' },
      { id: '2', icon: 'calendar-sharp', titulo: 'Agenda', texto: 'Organiza y revisa tus turnos', screen: 'Agenda' },
      { id: '3', icon: 'people-sharp', titulo: 'Clientes', texto: 'Gestiona tus clientes', screen: 'Clientes' },
      { id: '4', icon: 'calculator-sharp', titulo: 'Servicios', texto: 'Registra y consulta tus servicios', screen: 'Servicios' },
      { id: '5', icon: 'person-add-sharp', titulo: 'Proveedores', texto: 'Administra proveedores', screen: 'Proveedores' },
      { id: '6', icon: 'cart-sharp', titulo: 'Compras', texto: 'Gestiona tus compras', screen: 'Compras' },
    ],
    []
  );

  // Logout
  const handleLogout = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) {
            Alert.alert('Error al cerrar sesión', e?.message ?? 'Intenta nuevamente.');
          }
        },
      },
    ]);
  }, [navigation]);

  // Navegación
  const handleOpenScreen = useCallback(
    (screenName) => {
      if (!screenName) {
        Alert.alert('Próximamente', 'Esta sección aún no está disponible.');
        return;
      }
      navigation.navigate(screenName);
    },
    [navigation]
  );

  // Refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // Layout
  const GAP = 12;
  const NUM_COLS = 2;
  const CARD_WIDTH = Math.floor((screenWidth - (GAP * (NUM_COLS + 1))) / NUM_COLS);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleOpenScreen(item.screen)}
      style={({ pressed }) => [
        styles.card,
        { width: CARD_WIDTH },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
      ]}
      android_ripple={{ color: '#2a2a2a' }}
    >
      <Ionicons name={item.icon} size={40} color="#ff5b5b" style={styles.icono} />
      <Text style={styles.tituloCard}>{item.titulo}</Text>
      <Text style={styles.textoCard}>{item.texto}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={2} style={styles.saludoTexto}>
            {user
              ? `Hola, ${user.displayName?.split(' ')[0] || user.email?.split('@')[0]}!`
              : '¡Bienvenida/o!'}
          </Text>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={handleLogout}
          hitSlop={8}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Perfil')}
          accessibilityRole="imagebutton"
        >
          <Image
            source={{ uri: user?.photoURL || 'https://via.placeholder.com/50' }}
            style={styles.imagenUsuario}
          />
        </Pressable>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#ceebb3ff" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Error al cargar usuario</Text>
            <Text style={styles.errorDetails}>{String(error?.message ?? '')}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.tituloBody}>Acceso Rápido</Text>
            <FlatList
              data={items}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              numColumns={NUM_COLS}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1c1c1e',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a2a',
  },
  saludoTexto: { fontSize: 22, fontWeight: '800', color: '#fff' },
  imagenUsuario: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  logoutBtn: { marginRight: 8 },

  body: { flex: 1, paddingTop: 10 },
  tituloBody: { fontSize: 18, fontWeight: '700', color: '#fff', paddingHorizontal: 12, marginBottom: 6 },
  grid: { paddingHorizontal: 10, paddingBottom: 20 },

  card: {
    height: 180,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  icono: { marginBottom: 10 },
  tituloCard: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center' },
  textoCard: { fontSize: 12, color: '#bcd8e6', textAlign: 'center', lineHeight: 16, paddingHorizontal: 12 },

  center: { alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  loadingText: { color: '#ddd', marginTop: 8 },
  errorText: { color: '#ff6b6b', fontWeight: '700', marginBottom: 4 },
  errorDetails: { color: '#ccc', fontSize: 12 },
});
