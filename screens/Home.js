// ======================================================
// 🔹 1. IMPORTACIONES
// ======================================================
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ActivityIndicator,
  Alert, FlatList, Pressable, RefreshControl, StatusBar, useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#6ba1c1ff',
  acentoVerde: '#5BFB5B',
};

const CeldaEstadistica = ({ icono, titulo, valor, colorIcono }) => (
  <View style={styles.statCelda}>
    <Ionicons name={icono} size={24} color={colorIcono} />
    <Text style={styles.statValor}>{valor}</Text>
    <Text style={styles.statTitulo}>{titulo}</Text>
  </View>
);

const TopProductoItem = ({ item }) => (
  <Pressable style={styles.topProductoCard}>
    <Image
      source={item.imagen ? { uri: item.imagen } : require('../assets/placeholder.png')}
      style={styles.topProductoImagen}
    />
    <View style={styles.topProductoInfo}>
      <Text style={styles.topProductoNombre} numberOfLines={1}>{item.nombre}</Text>
      <Text style={styles.topProductoStock}>Stock: {item.cantidad}</Text>
    </View>
    <Text style={styles.topProductoPrecio}>${item.precio}</Text>
  </Pressable>
);

const AccesoRapidoItem = ({ item, onPress }) => (
  <Pressable
    onPress={() => onPress(item.screen)}
    style={({ pressed }) => [
      styles.accesoBoton,
      pressed && { backgroundColor: COLORES.superficie },
    ]}
  >
    <View style={[styles.accesoIconoBg, { backgroundColor: COLORES.acentoAzul }]}>
      <Ionicons name={item.icon} size={30} color={COLORES.textoPrincipal} />
    </View>
    <Text style={styles.accesoTitulo}>{item.titulo}</Text>
  </Pressable>
);

const RenderDashboardHeader = ({
  totalProductos, loadingProductos, topProductos, loadingTopProductos,
  datosGraficoBarras, loadingGraficoBarras, items, handleOpenScreen,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const ventasMes = '$ 128.500';
  const nuevosClientes = '12';

  return (
    <View style={styles.dashboardContainer}>
      <Text style={styles.tituloSeccion}>Resumen</Text>
      <View style={styles.statsContainer}>
        <CeldaEstadistica icono="pricetags-sharp" titulo="Total Productos"
          valor={loadingProductos ? '...' : totalProductos} colorIcono={COLORES.acentoPrincipal} />
        <CeldaEstadistica icono="cash-sharp" titulo="Ventas del Mes"
          valor={ventasMes} colorIcono={COLORES.acentoVerde} />
        <CeldaEstadistica icono="people-sharp" titulo="Nuevos Clientes"
          valor={nuevosClientes} colorIcono={COLORES.acentoAzul} />
      </View>

      {/*Gráfico de Barras  */}
      <Text style={styles.tituloSeccion}>Productos por Categoría</Text>
      <View style={styles.graficoContainer}>
        {loadingGraficoBarras ? (
          <ActivityIndicator color={COLORES.acentoAzul} style={{ height: 280 }} />
        ) : (
          <>
            <Text style={styles.ejeYLabel}>Productos</Text>
            <BarChart
              data={{
                labels: datosGraficoBarras.map(d => d.label),
                datasets: [{ data: datosGraficoBarras.map(d => d.value) }],
              }}
              width={screenWidth - 64}
              height={260}
              fromZero
              showValuesOnTopOfBars
              chartConfig={{
                backgroundColor: COLORES.superficie,
                backgroundGradientFrom: COLORES.superficie,
                backgroundGradientTo: COLORES.superficie,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(251,91,91,${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                propsForBackgroundLines: { strokeDasharray: '', strokeWidth: 1, stroke: '#333' },
              }}
              style={{ borderRadius: 16 }}
            />
            <Text style={styles.ejeXLabel}>Categoría</Text>
          </>
        )}
      </View>

      <Text style={styles.tituloSeccion}>Productos Nuevos</Text>
      <View style={styles.topProductoList}>
        {loadingTopProductos ? (
          <ActivityIndicator color={COLORES.textoPrincipal} style={{ marginVertical: 20 }} />
        ) : (
          topProductos.map(prod => <TopProductoItem key={prod.id} item={prod} />)
        )}
      </View>

      <Text style={styles.tituloSeccion}>Accesos Rápidos</Text>
      <View style={styles.accesosGridContainer}>
        {items.map(item => (
          <AccesoRapidoItem key={item.id} item={item} onPress={handleOpenScreen} />
        ))}
      </View>
    </View>
  );
};

export default function Home({ navigation }) {
  const [user, loading, error] = useAuthState(auth);
  const [totalProductos, setTotalProductos] = useState(0);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [topProductos, setTopProductos] = useState([]);
  const [loadingTopProductos, setLoadingTopProductos] = useState(true);
  const [datosGraficoBarras, setDatosGraficoBarras] = useState([]);
  const [loadingGraficoBarras, setLoadingGraficoBarras] = useState(true);

  // --- Firestore listeners ---
  useEffect(() => {
    const colRef = collection(db, 'productos');

    const unsubTotal = onSnapshot(colRef, snap => {
      setTotalProductos(snap.size);
      setLoadingProductos(false);
    });

    const qTop = query(colRef, orderBy('nombre', 'asc'), limit(3));
    const unsubTop = onSnapshot(qTop, snap => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTopProductos(lista);
      setLoadingTopProductos(false);
    });

    const unsubGraf = onSnapshot(colRef, snap => {
      const stockPorCat = {};
      snap.forEach(d => {
        const data = d.data();
        const tipo = data.tipo || 'Otros';
        const stock = data.cantidad || 0;
        stockPorCat[tipo] = (stockPorCat[tipo] || 0) + stock;
      });
      const dataFinal = Object.entries(stockPorCat)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);
      setDatosGraficoBarras(dataFinal);
      setLoadingGraficoBarras(false);
    });

    return () => { unsubTotal(); unsubTop(); unsubGraf(); };
  }, []);
  const displayName = user?.displayName?.trim() || 'Usuario';
  const items = useMemo(() => [
    { id: '1', icon: 'pricetags-sharp', titulo: 'Productos', screen: 'Productos' },
    { id: '2', icon: 'calendar-sharp', titulo: 'Agenda', screen: 'Agenda' },
    { id: '3', icon: 'people-sharp', titulo: 'Clientes', screen: 'Clientes' },
    { id: '4', icon: 'calculator-sharp', titulo: 'Servicios', screen: 'Servicios' },
    { id: '5', icon: 'person-add-sharp', titulo: 'Proveedores', screen: 'Proveedores' },
    { id: '6', icon: 'cart-sharp', titulo: 'Compras', screen: 'Compras' },
  ], []);

  const handleLogout = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Login');
          } catch (e) {
            Alert.alert('Error al cerrar sesión', e.message ?? 'Intenta nuevamente.');
          }
        },
      },
    ]);
  }, [navigation]);

  const handleOpenScreen = useCallback((screenName) => {
    if (!screenName) return Alert.alert('Próximamente', 'Esta sección aún no está disponible.');
    navigation.navigate(screenName);
  }, [navigation]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-sharp" size={26} color={COLORES.textoSecundario} />
        </Pressable>

        <View style={styles.headerLeft}>
          <Text style={styles.saludoTextoHola}>¡Bienvenido,</Text>
          <Text style={styles.saludoTextoNombre}>{displayName}!</Text>
        </View>

        <Pressable onPress={() => navigation.navigate('Perfil')} style={styles.avatarWrap}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Ionicons name="person" size={24} color={COLORES.textoPrincipal} />
            </View>
          )}
        </Pressable>

        <Pressable style={styles.iconBtn} onPress={() => Alert.alert('Notificaciones', 'Aún no tienes notificaciones.')}>
          <Ionicons name="notifications-outline" size={24} color={COLORES.textoSecundario} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {loading || loadingTopProductos || loadingGraficoBarras ? (
          <View style={styles.center}><ActivityIndicator size="large" color={COLORES.acentoPrincipal} /></View>
        ) : error ? (
          <View style={styles.center}><Text style={styles.errorText}>Error al cargar datos</Text></View>
        ) : (
          <FlatList
            data={[]}
            keyExtractor={() => 'main'}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORES.acentoPrincipal} />}
            ListHeaderComponent={
              <RenderDashboardHeader
                totalProductos={totalProductos}
                loadingProductos={loadingProductos}
                topProductos={topProductos}
                loadingTopProductos={loadingTopProductos}
                datosGraficoBarras={datosGraficoBarras}
                loadingGraficoBarras={loadingGraficoBarras}
                items={items}
                handleOpenScreen={handleOpenScreen}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

// --- ESTILOS UNIFICADOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORES.fondo },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  errorText: { color: COLORES.acentoPrincipal, fontWeight: '600' },
  // HEADER PRINCIPAL
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORES.fondo,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.superficie,
  },
  iconBtn: { marginHorizontal: 6, padding: 4 },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORES.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerLeft: { flex: 1, marginLeft: 12 },
  saludoTextoHola: { fontSize: 14, color: COLORES.textoSecundario },
  saludoTextoNombre: { fontSize: 18, fontWeight: 'bold', color: COLORES.textoPrincipal },
  // DASHBOARD
  dashboardContainer: { width: '100%', paddingBottom: 40 },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    paddingHorizontal: 16,
    marginTop: 28,
    marginBottom: 16,
  },

  // ESTADISTICAS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 20,
  },
  statCelda: { alignItems: 'center', flex: 1 },
  statValor: { fontSize: 22, fontWeight: 'bold', color: COLORES.textoPrincipal, marginTop: 8 },
  statTitulo: { fontSize: 12, color: COLORES.textoSecundario, marginTop: 4 },

  // GRÁFICO
  graficoContainer: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  ejeYLabel: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  ejeXLabel: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },

  // PRODUCTOs NUEVOS
  topProductoList: { paddingHorizontal: 16 },
  topProductoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  topProductoImagen: { width: 60, height: 60, borderRadius: 12, marginRight: 12, backgroundColor: COLORES.fondo },
  topProductoInfo: { flex: 1, justifyContent: 'center' },
  topProductoNombre: { fontSize: 16, fontWeight: '600', color: COLORES.textoPrincipal },
  topProductoStock: { fontSize: 14, color: COLORES.textoSecundario, marginTop: 4 },
  topProductoPrecio: { fontSize: 16, fontWeight: 'bold', color: COLORES.acentoPrincipal, marginLeft: 10 },

  // ACCESOS
  accesosGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  accesoBoton: {
    width: '30%',
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  accesoIconoBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  accesoTitulo: { fontSize: 13, fontWeight: '600', color: COLORES.textoPrincipal, textAlign: 'center' },
});
