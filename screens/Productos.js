import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl,
  Image, 
  SafeAreaView, // --- NUEVO ---
  StatusBar, // --- NUEVO ---
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig'; 

// --- NUEVA PALETA DE COLORES "NEÓN OSCURO" ---
const COLORES = {
  fondo: '#000000',
  superficie: '#190101', // Tailwind-950 (Casi negro para "tarjetas")
  textoPrincipal: '#FEE6E6', // Tailwind-50 (Blanco cálido)
  textoSecundario: '#A0A0A0', // Gris neutral
  
  acentoPrincipal: '#FB5B5B', // Tu color
  acentoAzul: '#5B5BFB',     // Triádica
  acentoVerde: '#5BFB5B',   // Triádica
};

const tipos = ['Todos', 'Skincare', 'Cabello', 'Uñas', 'Maquillaje'];

// --- Componente de Card (Rediseñado) ---
const ProductoCard = ({ item, navigation, onEliminar }) => {
  
  const handleVer = () => navigation.navigate('VerProducto', { item });
  const handleEditar = () => navigation.navigate('EditarProducto', { item });

  return (
    <View style={styles.card}>
      <View 
        style={[
          styles.disponibilidadBadge,
          item.cantidad > 0 ? styles.disponible : styles.agotado
        ]}
      >
        <Text style={styles.disponibilidadTexto}>
          {item.cantidad > 0 ? 'Disponible' : 'Agotado'}
        </Text>
      </View>
      
      <TouchableOpacity onPress={handleVer}>
        <Image
          source={item.imagen ? { uri: item.imagen } : require('../assets/placeholder.png')} 
          style={styles.cardImage}
        />
      </TouchableOpacity>

      <View style={styles.cardInfo}>
        <Text style={styles.nombre} numberOfLines={1}>{item.nombre}</Text>
        <Text style={styles.precio}>${item.precio}</Text>
        <Text style={styles.stock}>Stock: {item.cantidad}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleVer}>
          <Ionicons name="eye-outline" size={22} color={COLORES.acentoAzul} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEditar}>
          <Ionicons name="create-outline" size={22} color={COLORES.acentoVerde} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEliminar(item.id)}>
          <Ionicons name="trash-outline" size={22} color={COLORES.acentoPrincipal} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


// --- Componente Principal ---
export default function Productos({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  // (Lógica de fetchProductos, useEffect, onRefresh, handleEliminar se mantiene igual)
  const fetchProductos = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const snapshot = await getDocs(collection(db, 'productos'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProductos();
    });
    return unsubscribe;
  }, [fetchProductos, navigation]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchProductos();
  }

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
            fetchProductos();
          }
        }
      ]
    );
  };

  const productosFiltrados =
    tipoFiltro === 'Todos'
      ? productos
      : productos.filter(p => p.tipo === tipoFiltro);

  return (
    // --- CAMBIO: Contenedor principal ---
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />

      {/* Título de la Sección */}
      <Text style={styles.titulo}>Productos</Text>

      {/* Filtros (Usando FlatList horizontal para mejor UI) */}
      <View>
        <FlatList
          data={tipos}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filtroBtn,
                tipoFiltro === item && styles.filtroActivo,
              ]}
              onPress={() => setTipoFiltro(item)}
            >
              <Text
                style={[
                  styles.filtroText,
                  tipoFiltro === item && styles.filtroTextActivo,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Botón agregar (CTA Principal) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AgregarProducto')}
      >
        <Ionicons name="add" size={22} color={COLORES.textoPrincipal} />
        <Text style={styles.addButtonText}>Agregar producto</Text>
      </TouchableOpacity>

      {/* Lista de Productos */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORES.acentoPrincipal} />
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductoCard 
              item={item} 
              navigation={navigation} 
              onEliminar={handleEliminar} 
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={COLORES.acentoPrincipal} 
            />
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No hay productos.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

// --- ESTILOS "NEÓN OSCURO" ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORES.fondo, // Negro sólido
  },
  titulo: { 
    fontSize: 22, // Coherente con Home
    fontWeight: 'bold', 
    color: COLORES.textoPrincipal, 
    paddingHorizontal: 16,
    paddingTop: 16, // Espacio superior
    paddingBottom: 16,
  },
  // --- Estilos de Filtros (Rediseñados) ---
  filtrosContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filtroBtn: {
    backgroundColor: COLORES.superficie,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  filtroActivo: { 
    backgroundColor: COLORES.acentoPrincipal, // Tu color
    borderColor: COLORES.acentoPrincipal,
  },
  filtroText: { 
    color: COLORES.textoPrincipal, 
    fontSize: 13,
  },
  filtroTextActivo: { 
    color: COLORES.textoPrincipal, 
    fontWeight: '700',
  },
  // --- Estilo Botón Agregar (Rediseñado) ---
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORES.acentoAzul, // Acento Azul para CTA
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 16, // Coherente
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: COLORES.textoPrincipal,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  center: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { 
    color: COLORES.textoSecundario, 
    textAlign: 'center', 
    marginTop: 40 
  },

  // --- Estilos de Card (Rediseñados) ---
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: COLORES.superficie, // Fondo de tarjeta
    borderRadius: 16, // Coherente
    flex: 1,
    margin: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORES.superficie, // Borde sutil
  },
  cardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    backgroundColor: COLORES.fondo, // Fondo para placeholder
  },
  cardInfo: {
    padding: 12,
  },
  nombre: { 
    color: COLORES.textoPrincipal, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  precio: { 
    color: COLORES.acentoPrincipal, // Tu color
    fontSize: 15, 
    fontWeight: '700', 
    marginTop: 6 
  },
  stock: { 
    color: COLORES.textoSecundario, 
    fontSize: 13, 
    marginTop: 4 
  },
  actions: { 
    flexDirection: 'row', 
    gap: 10,
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: COLORES.fondo, // Divisor negro
  },
  // --- Estilos de Badge (Rediseñados) ---
  disponibilidadBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 1,
  },
  disponible: {
    backgroundColor: COLORES.acentoVerde, // Verde neón
  },
  agotado: {
    backgroundColor: COLORES.acentoPrincipal, // Rojo neón
  },
  disponibilidadTexto: {
    color: '#000000', // Texto negro para alto contraste con neón
    fontSize: 11,
    fontWeight: 'bold',
  },
});