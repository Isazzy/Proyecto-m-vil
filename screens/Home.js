import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'; 
import { BarChart } from 'react-native-chart-kit'; 

const COLORES = {
  fondo: '#000000',
  superficie: '#190101', 
  textoPrincipal: '#FEE6E6', 
  textoSecundario: '#A0A0A0', 
  acentoPrincipal: '#FB5B5B', 
  acentoAzul: '#6ba1c1ff',     
  acentoVerde: '#5BFB5B',   
};

// --- COMPONENTES INTERNOS ---
// Celda de Estadística
const CeldaEstadistica = ({ icono, titulo, valor, colorIcono }) => (
  <View style={dashboardStyles.statCelda}>
    <Ionicons name={icono} size={24} color={colorIcono} />
    <Text style={dashboardStyles.statValor}>{valor}</Text>
    <Text style={dashboardStyles.statTitulo}>{titulo}</Text>
  </View>
);

// Top Producto Item
const TopProductoItem = ({ item }) => (
  <Pressable style={dashboardStyles.topProductoCard}>
    <Image
      source={item.imagen ? { uri: item.imagen } : require('../assets/placeholder.png')} 
      style={dashboardStyles.topProductoImagen}
    />
    <View style={dashboardStyles.topProductoInfo}>
      <Text style={dashboardStyles.topProductoNombre} numberOfLines={1}>
        {item.nombre}
      </Text>
      <Text style={dashboardStyles.topProductoStock}>
        Stock: {item.cantidad}
      </Text>
    </View>
    <Text style={dashboardStyles.topProductoPrecio}>
      ${item.precio}
    </Text>
  </Pressable>
);

// Botón de Acceso Rápido
const AccesoRapidoItem = ({ item, onPress }) => (
  <Pressable
    onPress={() => onPress(item.screen)}
    style={({ pressed }) => [
      dashboardStyles.accesoBoton,
      pressed && { backgroundColor: COLORES.superficie },
    ]}
  >
    <View style={[dashboardStyles.accesoIconoBg, { backgroundColor: COLORES.acentoAzul }]}>
      <Ionicons name={item.icon} size={30} color={COLORES.textoPrincipal} />
    </View>
    <Text style={dashboardStyles.accesoTitulo}>{item.titulo}</Text>
  </Pressable>
);

// Header del Dashboard
const RenderDashboardHeader = ({
  totalProductos,
  loadingProductos,
  topProductos,
  loadingTopProductos,
  datosGraficoBarras,
  loadingGraficoBarras,
  items,
  handleOpenScreen,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Datos hardcodeados
  const ventasMes = '$ 128.500';
  const nuevosClientes = '12';

  return (
    <View style={dashboardStyles.dashboardContainer}>
      {/* Estadísticas */}
      <Text style={dashboardStyles.tituloSeccion}>Resumen</Text>
      <View style={dashboardStyles.statsContainer}>
        <CeldaEstadistica
          icono="pricetags-sharp"
          titulo="Total Productos"
          valor={loadingProductos ? '...' : totalProductos}
          colorIcono={COLORES.acentoPrincipal}
        />
        <CeldaEstadistica
          icono="cash-sharp"
          titulo="Ventas del Mes"
          valor={ventasMes}
          colorIcono={COLORES.acentoVerde}
        />
        <CeldaEstadistica
          icono="people-sharp"
          titulo="Nuevos Clientes"
          valor={nuevosClientes}
          colorIcono={COLORES.acentoAzul}
        />
      </View>

      {/* Gráfico de Barras */}
      <Text style={dashboardStyles.tituloSeccion}>Productos por Categoría</Text>
      <View style={dashboardStyles.graficoContainer}>
        {loadingGraficoBarras ? (
          <ActivityIndicator color={COLORES.acentoAzul} style={{ height: 280 }} />
        ) : (
          <>
            <Text style={dashboardStyles.ejeYLabel}>Productos</Text>
            <BarChart
              data={{
                labels: datosGraficoBarras.map(d => d.label),
                datasets: [{ data: datosGraficoBarras.map(d => d.value) }],
              }}
              width={screenWidth - 64}
              height={260}
              fromZero={true}
              showValuesOnTopOfBars={true}
              chartConfig={{
                backgroundColor: COLORES.superficie,
                backgroundGradientFrom: COLORES.superficie,
                backgroundGradientTo: COLORES.superficie,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(251, 91, 91, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForBackgroundLines: { strokeDasharray: '', strokeWidth: 1, stroke: '#333333' },
              }}
              verticalLabelRotation={0}
              withInnerLines={true}
              style={{ borderRadius: 16 }}
            />
            <Text style={dashboardStyles.ejeXLabel}>Categoría</Text>
          </>
        )}
      </View>

      {/* Top Productos */}
      <Text style={dashboardStyles.tituloSeccion}>Productos Nuevos</Text>
      <View style={dashboardStyles.topProductoList}>
        {loadingTopProductos ? (
          <ActivityIndicator color={COLORES.textoPrincipal} style={{ marginVertical: 20 }} />
        ) : (
          topProductos.map((prod) => <TopProductoItem key={prod.id} item={prod} />)
        )}
      </View>

      {/* Accesos Rápidos */}
      <Text style={dashboardStyles.tituloSeccion}>Accesos Rápidos</Text>
      <View style={dashboardStyles.accesosGridContainer}>
        {items.map((item) => (
          <AccesoRapidoItem key={item.id} item={item} onPress={handleOpenScreen} />
        ))}
      </View>
    </View>
  );
};

// --- PANTALLA PRINCIPAL ---
export default function Home({ navigation }) { 
  const [user, loading, error] = useAuthState(auth);
  
  const [totalProductos, setTotalProductos] = useState(0);
  const [loadingProductos, setLoadingProductos] = useState(true);
  const [topProductos, setTopProductos] = useState([]);
  const [loadingTopProductos, setLoadingTopProductos] = useState(true);
  const [datosGraficoBarras, setDatosGraficoBarras] = useState([]);
  const [loadingGraficoBarras, setLoadingGraficoBarras] = useState(true);

  useEffect(() => {
    const colRef = collection(db, 'productos');

    const unsubscribeTotal = onSnapshot(colRef, (snapshot) => {
      setTotalProductos(snapshot.size);
      setLoadingProductos(false);
    }, () => setLoadingProductos(false));

    const qTop = query(colRef, orderBy('nombre', 'asc'), limit(3));
    const unsubscribeTop = onSnapshot(qTop, (snapshot) => {
      const listaTop = [];
      snapshot.forEach((doc) => listaTop.push({ id: doc.id, ...doc.data() }));
      setTopProductos(listaTop);
      setLoadingTopProductos(false);
    }, () => setLoadingTopProductos(false));

    const unsubscribeGrafico = onSnapshot(colRef, (snapshot) => {
      const stockPorCategoria = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const tipo = data.tipo || 'Otros';
        const stock = data.cantidad || 0;
        stockPorCategoria[tipo] = (stockPorCategoria[tipo] || 0) + stock;
      });
      const dataFinal = Object.keys(stockPorCategoria).map((key) => ({
        label: key,
        value: stockPorCategoria[key],
      }));
      dataFinal.sort((a, b) => b.value - a.value);
      setDatosGraficoBarras(dataFinal);
      setLoadingGraficoBarras(false);
    }, () => setLoadingGraficoBarras(false));

    return () => { unsubscribeTotal(); unsubscribeTop(); unsubscribeGrafico(); };
  }, []);

  const displayName = (user?.displayName?.trim()) || 'Usuario';

  const items = useMemo(() => [
    { id: '1', icon: 'pricetags-sharp', titulo: 'Productos', screen: 'Productos' }, 
    { id: '2', icon: 'calendar-sharp', titulo: 'Agenda', screen: 'Agenda' }, 
    { id: '3', icon: 'people-sharp', titulo: 'Clientes', screen: 'Clientes' },
    { id: '4D', icon: 'calculator-sharp', titulo: 'Servicios', screen: 'Servicios' },
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
            Alert.alert('Error al cerrar sesión', e?.message ?? 'Intenta nuevamente.');
          }
        },
      },
    ]);
  }, [navigation]); 
  
  const handleOpenScreen = useCallback((screenName) => { 
    if (!screenName) {
      Alert.alert('Próximamente', 'Esta sección aún no está disponible.');
      return;
    }
    navigation.navigate(screenName);
  }, [navigation]); 
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-sharp" size={26} color={COLORES.textoSecundario} />
        </Pressable>

        <View style={styles.headerLeft}>
          <Text style={styles.saludoTextoHola}>¡Bienvenido,</Text>
          <Text style={styles.saludoTextoNombre}>{displayName}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Perfil')}
          style={styles.avatarWrap}
        >
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

      {/* BODY */}
      <View style={styles.body}>
        {loading || loadingTopProductos || loadingGraficoBarras ? ( 
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORES.acentoPrincipal} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Error al cargar datos</Text>
          </View>
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

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORES.fondo },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: COLORES.fondo, borderBottomWidth: 1, borderBottomColor: COLORES.superficie },
  iconBtn: { marginHorizontal: 6, padding: 4 },
  avatarWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORES.superficie, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: COLORES.superficie },
  avatarImage: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerLeft: { flex: 1, marginLeft: 12 },
  saludoTextoHola: { fontSize: 14, color: COLORES.textoSecundario },
  saludoTextoNombre: { fontSize: 18, fontWeight: 'bold', color: COLORES.textoPrincipal },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 50 },
  errorText: { color: COLORES.acentoPrincipal, fontWeight: '600' },
});

const dashboardStyles = StyleSheet.create({
  dashboardContainer: { width: '100%', paddingBottom: 40 },
  tituloSeccion: { fontSize: 20, fontWeight: 'bold', color: COLORES.textoPrincipal, paddingHorizontal: 16, marginTop: 28, marginBottom: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: COLORES.superficie, borderRadius: 16, marginHorizontal: 16, padding: 20 },
  statCelda: { alignItems: 'center', flex: 1 },
  statValor: { fontSize: 22, fontWeight: 'bold', color: COLORES.textoPrincipal, marginTop: 8 },
  statTitulo: { fontSize: 12, color: COLORES.textoSecundario, marginTop: 4 },
  graficoContainer: { backgroundColor: COLORES.superficie, borderRadius: 16, marginHorizontal: 16, padding: 16, paddingBottom: 20, alignItems: 'center' },
  topProductoList: { paddingHorizontal: 16 },
  topProductoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORES.superficie, padding: 12, borderRadius: 16, marginBottom: 10 },
  topProductoImagen: { width: 60, height: 60, borderRadius: 12, marginRight: 12, backgroundColor: COLORES.fondo },
  topProductoInfo: { flex: 1, justifyContent: 'center' },
  topProductoNombre: { fontSize: 16, fontWeight: '600', color: COLORES.textoPrincipal },
  topProductoStock: { fontSize: 14, color: COLORES.textoSecundario, marginTop: 4 },
  topProductoPrecio: { fontSize: 16, fontWeight: 'bold', color: COLORES.acentoPrincipal, marginLeft: 10 },
  accesosGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  accesoBoton: { width: '30%', backgroundColor: COLORES.superficie, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  accesoIconoBg: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  accesoTitulo: { fontSize: 13, fontWeight: '600', color: COLORES.textoPrincipal, textAlign: 'center' },
  ejeYLabel: { color: COLORES.textoSecundario, fontSize: 12, marginBottom: 4, marginLeft: 4, fontWeight: '600' },
  ejeXLabel: { color: COLORES.textoSecundario, fontSize: 12, marginTop: 4, textAlign: 'center', fontWeight: '600' },
});
