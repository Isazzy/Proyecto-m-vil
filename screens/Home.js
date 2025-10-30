import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Home({ navigation }) {
  // ----- HOOKS -----
  const [user, loading, error] = useAuthState(auth);
  const { width: screenWidth } = useWindowDimensions();

  // Nombre a mostrar (sin fallback al correo)
  const displayName =
    (user?.displayName && user.displayName.trim()) ||
    (user?.providerData?.[0]?.displayName && user.providerData[0].displayName.trim()) ||
    'Usuario';

  // Cards del cuerpo
  const items = useMemo(
    () => [
      { id: '1', icon: 'pricetags-sharp',  titulo: 'Productos',   texto: 'Gestiona todos los productos', screen: 'Productos' },
      { id: '2', icon: 'calendar-sharp',   titulo: 'Agenda',      texto: 'Organiza y revisa tus turnos', screen: 'Agenda' },
      { id: '3', icon: 'people-sharp',     titulo: 'Usuarios',    texto: 'Gestiona tus clientes',        screen: 'Usuarios' },
      { id: '4', icon: 'calculator-sharp', titulo: 'Servicios',   texto: 'Registra y consulta ventas',   screen: 'Servicios' },
      { id: '5', icon: 'person-add-sharp', titulo: 'Proveedores', texto: 'Administra proveedores',        screen: 'Proveedores' },
      { id: '6', icon: 'cart-sharp',       titulo: 'Compras',     texto: 'Gestiona tus compras',         screen: 'Compras' },
    ],
    []
  );

  // Notificaciones (header)
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Venta realizada', body: 'Orden #A102 por $45.000', time: 'Hace 5 min', unread: true },
    { id: 'n2', title: 'Turno cancelado', body: 'Juan Pérez canceló 16:00', time: 'Hace 20 min', unread: true },
  ]);
  const unreadCount = notifications.filter(n => n.unread).length;

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

  // ======= MENÚ NOTIFICACIONES (HEADER) =======
  const [headerHeight, setHeaderHeight] = useState(64);
  const [bellAnchor, setBellAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [notifOpen, setNotifOpen] = useState(false);
  const notifAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(notifAnim, {
      toValue: notifOpen ? 1 : 0,
      duration: 180,
      easing: notifOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [notifOpen, notifAnim]);

  const notifOverlayOpacity = notifAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.25] });
  const notifMenuTranslateY = notifAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] });
  const notifMenuOpacity = notifAnim;

  const NOTIF_MENU_WIDTH = Math.min(screenWidth - 40, 320);
  const bellCenterX = bellAnchor.x + bellAnchor.width / 2;
  const notifLeftCandidate = bellCenterX - NOTIF_MENU_WIDTH / 2;
  const notifMenuLeft = Math.max(10, Math.min(notifLeftCandidate, screenWidth - NOTIF_MENU_WIDTH - 10));

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  }, []);
  const openNotif = useCallback(() => setNotifOpen(true), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);

  // Grid
  const GAP = 14;
  const NUM_COLS = 2;
  const CARD_WIDTH = Math.floor((screenWidth - (GAP * (NUM_COLS + 1))) / NUM_COLS);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => handleOpenScreen(item.screen)}
      style={({ pressed }) => [
        styles.card,
        { width: CARD_WIDTH, margin: GAP / 2 },
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
      ]}
      android_ripple={{ color: '#2a2a2a' }}
      accessibilityRole="button"
      accessibilityLabel={item.titulo}
    >
      <Ionicons name={item.icon} size={38} color="#ff5b5b" style={styles.icono} />
      <Text style={styles.tituloCard}>{item.titulo}</Text>
      <Text style={styles.textoCard}>{item.texto}</Text>
    </Pressable>
  );

  // ----- RENDER -----
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View
        style={styles.header}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.headerLeft}>
          <Text numberOfLines={2} style={styles.saludoTexto}>
            {`Hola,\n${displayName}!`}
          </Text>
          <Text style={styles.subtituloHeader}>¿Qué querés hacer hoy?</Text>
        </View>

        {/* Campana de Notificaciones */}
        <Pressable
          style={styles.bellWrapper}
          onPress={notifOpen ? closeNotif : openNotif}
          onLayout={(e) => setBellAnchor(e.nativeEvent.layout)}
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : String(unreadCount)}</Text>
            </View>
          )}
        </Pressable>

        {/* Avatar + estado online (siempre visible) */}
        <Pressable
          style={styles.avatarWrap}
          onPress={() => navigation.navigate('Perfil')}
          onLongPress={() => navigation.navigate('Configuracion')}
          accessibilityRole="imagebutton"
          accessibilityLabel="Abrir perfil"
          hitSlop={6}
        >
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person-circle" size={44} color="#fff" />
            </View>
          )}
          <View style={styles.onlineDot} />
        </Pressable>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {loading ? (
          <View style={[styles.center, { paddingTop: 24 }]}>
            <ActivityIndicator size="large" color="#ceebb3ff" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : error ? (
          <View style={[styles.center, { paddingTop: 24, paddingHorizontal: 24 }]}>
            <Text style={styles.errorText}>Ocurrió un error al obtener el usuario.</Text>
            <Text style={styles.errorDetails}>{String(error?.message ?? '')}</Text>
            <Pressable
              onPress={() => navigation.replace('Login')}
              style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.retryText}>Ir al Login</Text>
            </Pressable>
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
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              removeClippedSubviews
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
              }
            />
          </>
        )}
      </View>

      {/* ===== Overlay + Menú de Notificaciones (HEADER) ===== */}
      <Animated.View
        pointerEvents={notifOpen ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: notifOverlayOpacity }]}
      >
        <Pressable style={{ flex: 1 }} onPress={closeNotif} />
      </Animated.View>

      <Animated.View
        pointerEvents={notifOpen ? 'auto' : 'none'}
        style={[
          styles.notifMenuContainer,
          {
            top: headerHeight + 6,
            left: notifMenuLeft,
            width: NOTIF_MENU_WIDTH,
            opacity: notifMenuOpacity,
            transform: [{ translateY: notifMenuTranslateY }],
          },
        ]}
      >
        <View style={styles.notifMenu}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle}>Notificaciones</Text>
            <Pressable onPress={markAllRead} hitSlop={8}>
              <Text style={styles.markAll}>Marcar todas como leídas</Text>
            </Pressable>
          </View>

          {notifications.length === 0 ? (
            <View style={{ padding: 14 }}>
              <Text style={{ color: '#bbb' }}>No hay notificaciones.</Text>
            </View>
          ) : (
            notifications.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => {
                  setNotifications(prev => prev.map(x => x.id === n.id ? ({ ...x, unread: false }) : x));
                  closeNotif();
                }}
                style={({ pressed }) => [styles.notifItem, pressed && { opacity: 0.9 }]}
                android_ripple={{ color: '#2a2a2a' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {n.unread && <View style={styles.unreadDot} />}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifItemTitle}>{n.title}</Text>
                    <Text style={styles.notifItemBody}>{n.body}</Text>
                  </View>
                </View>
                <Text style={styles.notifTime}>{n.time}</Text>
              </Pressable>
            ))
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1c1c1e',
    borderBottomColor: '#2a2a2a',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flex: 1, paddingRight: 8, paddingTop: 30 },
  saludoTexto: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 26 },
  subtituloHeader: { fontSize: 13, color: '#9a9a9a', marginTop: 4 },

  // Bell
  bellWrapper: { marginRight: 12, padding: 6 },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // Avatar + online
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginLeft: 4,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759', // verde iOS
    borderWidth: 2,
    borderColor: '#1c1c1e', // aro para separarlo del avatar
  },

  // Body
  body: { flex: 1, backgroundColor: '#121212', paddingTop: 10, paddingBottom: 12 },
  tituloBody: { fontSize: 18, fontWeight: '700', color: '#fff', paddingHorizontal: 16, marginBottom: 10 },
  grid: { paddingHorizontal: 12, paddingBottom: 24 },

  // Cards
  card: {
    height: 190,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  icono: { marginBottom: 10 },
  tituloCard: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 8 },
  textoCard: { fontSize: 12, color: '#bcd8e6', textAlign: 'center', lineHeight: 16, paddingHorizontal: 12 },

  // Menú Notificaciones (HEADER)
  notifMenuContainer: { position: 'absolute' },
  notifMenu: {
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: 360,
  },
  notifHeader: {
    paddingHorizontal: 14,
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
