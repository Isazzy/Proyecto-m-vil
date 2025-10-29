import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../src/config/firebaseConfig';


const tipos = ['Todos', 'Skincare', 'Cabello', 'Uñas', 'Maquillaje', 'Barbería'];

export default function Productos({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipoFiltro, setTipoFiltro] = useState('Todos');

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'productos'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

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

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.descripcion}>Tipo: {item.tipo}</Text>
        <Text style={styles.precio}>${item.precio} — Cant: {item.cantidad}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('VerProducto', { item })}>
          <Ionicons name="eye-outline" size={22} color="#97c5df" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('EditarProducto', { item })}>
          <Ionicons name="create-outline" size={22} color="#ffd166" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEliminar(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Productos</Text>

      {/* Filtros */}
      <View style={styles.filtros}>
        {tipos.map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[
              styles.filtroBtn,
              tipoFiltro === tipo && styles.filtroActivo,
            ]}
            onPress={() => setTipoFiltro(tipo)}
          >
            <Text
              style={[
                styles.filtroText,
                tipoFiltro === tipo && styles.filtroTextActivo,
              ]}
            >
              {tipo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón agregar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AgregarProducto')}
      >
        <Ionicons name="add-circle-outline" size={22} color="#fff" />
        <Text style={{ color: '#fff', marginLeft: 6 }}>Agregar producto</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#97c5df" />
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchProductos} tintColor="#fff" />
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No hay productos.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  titulo: { fontSize: 22, fontWeight: '800', color: '#fff', padding: 16 },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filtroBtn: {
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  filtroActivo: { backgroundColor: '#97c5df' },
  filtroText: { color: '#fff', fontSize: 13 },
  filtroTextActivo: { color: '#000', fontWeight: '700' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  nombre: { color: '#fff', fontSize: 16, fontWeight: '700' },
  descripcion: { color: '#ccc', fontSize: 13, marginTop: 4 },
  precio: { color: '#97c5df', fontSize: 14, fontWeight: '700', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#aaa', textAlign: 'center', marginTop: 40 },
});
