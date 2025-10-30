// Productos.js (UI mejorada + paginado + skeleton + swipe + refresh al volver)
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl, TextInput,
  SafeAreaView, StatusBar, Dimensions, ScrollView, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  collection, getDocs, deleteDoc, doc,
  query as fsQuery, orderBy, limit, startAfter, getCountFromServer
} from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');
const tipos = ['Todos', 'Skincare', 'Cabello', 'Uñas', 'Maquillaje', 'Barbería'];
const PAGE_SIZE = 12;

// ---------- Skeleton Loader ----------
function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });

  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.skelLineLg, { opacity }]} />
        <Animated.View style={[styles.skelBadge, { opacity, marginTop: 10 }]} />
        <Animated.View style={[styles.skelLineSm, { opacity, marginTop: 12 }]} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <Animated.View style={[styles.skelPill, { opacity, flex: 0 }]} />
          <Animated.View style={[styles.skelPill, { opacity, width: 110 }]} />
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.actionBtn} />
        <View style={styles.actionBtn} />
        <View style={styles.actionBtn} />
      </View>
    </View>
  );
}

// ---------- Swipe Action Buttons ----------
function RightActions({ onEdit, onDelete }) {
  return (
    <View style={styles.rightActions}>
      <TouchableOpacity style={[styles.swipeBtn, styles.swipeEdit]} onPress={onEdit}>
        <Ionicons name="create-outline" size={20} color="#0e1116" />
        <Text style={styles.swipeTextDark}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.swipeBtn, styles.swipeDelete]} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color="#0e1116" />
        <Text style={styles.swipeTextDark}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}
function LeftActions({ onView }) {
  return (
    <View style={styles.leftActions}>
      <TouchableOpacity style={[styles.swipeBtn, styles.swipeView]} onPress={onView}>
        <Ionicons name="eye-outline" size={20} color="#0e1116" />
        <Text style={styles.swipeTextDark}>Ver</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function Productos({ navigation }) {
  const route = useRoute();
  const nav = useNavigation();
  const listRef = useRef(null);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  // Nuevos estados UI
  const [queryText, setQueryText] = useState('');
  const [orden, setOrden] = useState('recientes'); // 'recientes' | 'precioAsc' | 'precioDesc' | 'nombre'

  // Paginación
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const totalCountRef = useRef(null); // opcional

  // Highlight + toast al volver de AgregarProducto
  const [highlightId, setHighlightId] = useState(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const getOrderFieldAndDir = useCallback(() => {
    if (orden === 'recientes') return { field: 'createdAt', dir: 'desc', fallbackField: 'nombre', fallbackDir: 'asc' };
    if (orden === 'precioAsc') return { field: 'precio', dir: 'asc', fallbackField: 'precio', fallbackDir: 'asc' };
    if (orden === 'precioDesc') return { field: 'precio', dir: 'desc', fallbackField: 'precio', fallbackDir: 'desc' };
    return { field: 'nombre', dir: 'asc', fallbackField: 'nombre', fallbackDir: 'asc' };
  }, [orden]);

  const buildBaseQuery = useCallback((useStartAfter = false, startAfterDoc = null) => {
    const col = collection(db, 'productos');
    const { field, dir } = getOrderFieldAndDir();
    let q = fsQuery(col, orderBy(field, dir), limit(PAGE_SIZE));
    if (useStartAfter && startAfterDoc) {
      q = fsQuery(col, orderBy(field, dir), startAfter(startAfterDoc), limit(PAGE_SIZE));
    }
    return q;
  }, [getOrderFieldAndDir]);

  const fetchFirstPage = useCallback(async () => {
    try {
      setLoading(true);
      setHasMore(true);
      setLastDoc(null);

      // (Opcional) contador total
      try {
        const coll = collection(db, 'productos');
        const snapCount = await getCountFromServer(coll);
        totalCountRef.current = snapCount.data().count;
      } catch {
        totalCountRef.current = null;
      }

      const q = buildBaseQuery(false, null);
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() }));

      setProductos(data);
      setLastDoc(snap.docs.length ? snap.docs[snap.docs.length - 1] : null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildBaseQuery]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    try {
      setLoadingMore(true);
      const q = buildBaseQuery(true, lastDoc);
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, _snap: d, ...d.data() }));

      setProductos(prev => [...prev, ...data]);
      setLastDoc(snap.docs.length ? snap.docs[snap.docs.length - 1] : null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch {
      // no-op suave
    } finally {
      setLoadingMore(false);
    }
  }, [buildBaseQuery, hasMore, lastDoc, loadingMore]);

  // Primera carga y cuando cambia el orden
  useEffect(() => {
    fetchFirstPage();
  }, [fetchFirstPage, orden]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFirstPage();
  }, [fetchFirstPage]);

  const handleEliminar = async (id) => {
    Alert.alert(
      'Eliminar producto',
      '¿Seguro que quieres eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            await deleteDoc(doc(db, 'productos', id));
            fetchFirstPage();
          }
        }
      ]
    );
  };

  // ✅ REFRESH + HIGHLIGHT al volver desde AgregarProducto
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        fetchFirstPage().then(() => {
          listRef.current?.scrollToOffset?.({ offset: 0, animated: true });
          if (route.params?.highlightId) {
            setHighlightId(route.params.highlightId);
            Animated.sequence([
              Animated.timing(toastAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
              Animated.delay(1200),
              Animated.timing(toastAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
            ]).start(() => setHighlightId(null));
          }
        });
        // limpiar params para evitar loops
        nav.setParams({ refresh: undefined, highlightId: undefined });
      }
    }, [route.params, fetchFirstPage, nav, toastAnim])
  );

  // ---- Derivados de UI: filtro + búsqueda (sobre la página cargada) ----
  const productosFiltrados = useMemo(() => {
    const f = (s) => String(s || '').toLowerCase();
    let data =
      tipoFiltro === 'Todos'
        ? productos
        : productos.filter(p => f(p.tipo) === f(tipoFiltro));
    if (queryText.trim()) {
      const q = queryText.trim().toLowerCase();
      data = data.filter(p => f(p.nombre).includes(q) || f(p.tipo).includes(q));
    }
    return data;
  }, [productos, tipoFiltro, queryText]);

  const renderItem = ({ item }) => {
    const onView = () => navigation.navigate('VerProducto', { item });
    const onEdit = () => navigation.navigate('EditarProducto', { item });
    const onDelete = () => handleEliminar(item.id);
    const isHighlighted = item.id === highlightId;

    return (
      <Swipeable
        renderLeftActions={() => <LeftActions onView={onView} />}
        renderRightActions={() => <RightActions onEdit={onEdit} onDelete={onDelete} />}
        overshootLeft={false}
        overshootRight={false}
      >
        <View style={[styles.card, isHighlighted && styles.cardHighlight]}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeaderRow}>
              <Text numberOfLines={1} style={styles.nombre}>{item.nombre}</Text>
              {!!item.tipo && (
                <View style={styles.badgeTipo}>
                  <Text style={styles.badgeTipoText}>{item.tipo}</Text>
                </View>
              )}
            </View>
            <Text style={styles.descripcion} numberOfLines={2}>
              {item.descripcion ? item.descripcion : 'Sin descripción'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.pricePill}>
                <Ionicons name="pricetag-outline" size={14} color="#0e1116" />
                <Text style={styles.pricePillText}>${item.precio ?? 0}</Text>
              </View>
              <View style={styles.qtyPill}>
                <Ionicons name="cube-outline" size={14} color="#dbe8f2" />
                <Text style={styles.qtyPillText}>Stock: {item.cantidad ?? 0}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onView} accessibilityLabel="Ver producto">
              <Ionicons name="eye-outline" size={20} color="#97c5df" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit} accessibilityLabel="Editar producto">
              <Ionicons name="create-outline" size={20} color="#ffd166" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete} accessibilityLabel="Eliminar producto">
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
      </Swipeable>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 24 }} />;
    return (
      <View style={{ paddingVertical: 14, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#97c5df" />
        <Text style={{ color: '#a9b4bf', marginTop: 6 }}>Cargando más…</Text>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* ✅ Toast éxito “Producto agregado” */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [{
                translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] })
              }],
            },
          ]}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#0e1116" />
          <Text style={styles.toastText}>Producto agregado</Text>
        </Animated.View>

        {/* Header con gradiente + título + contador */}
        <LinearGradient
          colors={['#1f1f1f', '#161616']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.titulo}>Productos</Text>

            <View style={styles.counterBubble}>
              <Text style={styles.counterText}>{productosFiltrados.length}</Text>
            </View>
          </View>

          {/* Buscador + Orden */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color="#9aa3ab" style={{ marginRight: 6 }} />
              <TextInput
                value={queryText}
                onChangeText={setQueryText}
                placeholder="Buscar por nombre o tipo..."
                placeholderTextColor="#9aa3ab"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {!!queryText && (
                <TouchableOpacity onPress={() => setQueryText('')}>
                  <Ionicons name="close-circle" size={16} color="#9aa3ab" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.orderBtn}
              onPress={() => {
                const chain = ['recientes', 'precioAsc', 'precioDesc', 'nombre'];
                const next = chain[(chain.indexOf(orden) + 1) % chain.length];
                setOrden(next);
              }}
            >
              <Ionicons name="swap-vertical-outline" size={16} color="#dbe8f2" />
              <Text style={styles.orderText}>
                {orden === 'recientes' ? 'Recientes' :
                 orden === 'precioAsc' ? 'Precio ↑' :
                 orden === 'precioDesc' ? 'Precio ↓' : 'Nombre A-Z'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chips de filtro */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtrosRow}
          >
            {tipos.map((tipo) => {
              const active = tipoFiltro === tipo;
              return (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.filtroChip, active && styles.filtroChipActive]}
                  onPress={() => setTipoFiltro(tipo)}
                >
                  <Text style={[styles.filtroChipText, active && styles.filtroChipTextActive]}>
                    {tipo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LinearGradient>

        {/* Lista */}
        {loading ? (
          <View style={styles.listContent}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Ionicons name="file-tray-outline" size={40} color="#68707a" />
                <Text style={styles.emptyTitle}>Sin productos</Text>
                <Text style={styles.emptyText}>
                  Probá cambiar el filtro, o agregá uno nuevo.
                </Text>
              </View>
            }
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.3}
            onEndReached={fetchNextPage}
          />
        )}

        {/* FAB Agregar */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AgregarProducto')}
          accessibilityRole="button"
          accessibilityLabel="Agregar producto"
        >
          <Ionicons name="add" size={26} color="#0e1116" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },

  // Toast
  toast: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    zIndex: 20,
    backgroundColor: '#121212',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#6aa9c8',
    marginTop: 0,
  },
  toastText: { color: '#0e1116', fontWeight: '800' },

  // Header
  header: {
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#000',
  },
  headerRow: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.15)',
  },
  titulo: { fontSize: 20, fontWeight: '800', color: '#fff' },
  counterBubble: {
    minWidth: 28, height: 28, paddingHorizontal: 8,
    borderRadius: 14, backgroundColor: '#97c5df',
    alignItems: 'center', justifyContent: 'center',
  },
  counterText: { color: '#0e1116', fontWeight: '800' },

  // Search + Orden
  searchRow: {
    marginTop: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f24',
    borderWidth: 1, borderColor: '#232b33',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: { flex: 1, color: '#e6edf3', fontSize: 14 },
  orderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#1a1f24',
    borderWidth: 1, borderColor: '#232b33',
    borderRadius: 12, paddingHorizontal: 10, height: 40,
  },
  orderText: { color: '#dbe8f2', fontWeight: '700', fontSize: 12 },

  // Chips de filtro
  filtrosRow: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6 },
  filtroChip: {
    marginRight: 8,
    backgroundColor: '#1f1f1f',
    borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  filtroChipActive: { backgroundColor: '#ff5b5b', borderColor: '#97c5df' },
  filtroChipText: { color: '#dbe8f2', fontSize: 12, fontWeight: '600' },
  filtroChipTextActive: { color: '#fff' },

  // Lista
  listContent: { padding: 16, paddingBottom: 100 },

  // Card
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#2a2a2a',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  // ✅ highlight visual del recién agregado
  cardHighlight: {
    borderColor: '#ff5b5b',
    shadowColor: '#ff5b5b',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nombre: { color: '#fff', fontSize: 16, fontWeight: '800', flexShrink: 1 },
  badgeTipo: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12,
    backgroundColor: '#2a3038', borderWidth: 1, borderColor: '#333b45',
  },
  badgeTipoText: { color: '#97c5df', fontSize: 11, fontWeight: '700' },
  descripcion: { color: '#a9b4bf', fontSize: 12, marginTop: 6 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  pricePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ff7b7b', borderRadius: 10,
    paddingHorizontal: 8, height: 26,
  },
  pricePillText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  qtyPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ff7b7b', borderWidth: 1, borderColor: '#2e3a46',
    borderRadius: 10, paddingHorizontal: 8, height: 26,
  },
  qtyPillText: { color: '#dbe8f2', fontWeight: '700', fontSize: 12 },

  actions: { flexDirection: 'row', gap: 8, paddingTop: 2 },
  actionBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#12161b', borderWidth: 1, borderColor: '#232b33',
    alignItems: 'center', justifyContent: 'center',
  },

  // Swipe containers
  rightActions: { flexDirection: 'row', alignItems: 'center', height: '90%',borderRadius:20 },
  leftActions: { justifyContent: 'center', height: '90%' },
  swipeBtn: {
    height: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeEdit: { backgroundColor: '#ffd166' },
  swipeDelete: { backgroundColor: '#ff6b6b' },
  swipeView: { backgroundColor: '#97c5df' },
  swipeTextDark: { color: '#0e1116', fontWeight: '800', marginTop: 4 },

  // Skeleton bits
  skelLineLg: { width: width * 0.5, height: 16, backgroundColor: '#222831', borderRadius: 6 },
  skelLineSm: { width: width * 0.65, height: 12, backgroundColor: '#222831', borderRadius: 6 },
  skelBadge: { width: 80, height: 18, backgroundColor: '#222831', borderRadius: 10 },
  skelPill: { width: 90, height: 24, backgroundColor: '#222831', borderRadius: 12 },

  // Loading / vacío
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: '#e6edf3', fontSize: 16, fontWeight: '800', marginTop: 12 },
  emptyText: { color: '#a9b4bf', marginTop: 6 },

  // FAB
  fab: {
    position: 'absolute', right: 16, bottom: 20,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#ff7b7b',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ccc', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});

