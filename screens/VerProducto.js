import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { db, storage } from '../src/config/firebaseConfig';


export default function VerProducto({ route }) {
  const { item } = route.params;

  return (
    <ScrollView style={styles.container}>
      {item.imagen ? (
        <Image source={{ uri: item.imagen }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Text style={{ color: '#777' }}>Sin imagen</Text>
        </View>
      )}

      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.tipo}>Tipo: {item.tipo}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Precio:</Text>
        <Text style={styles.value}>${item.precio}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Cantidad:</Text>
        <Text style={styles.value}>{item.cantidad}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  noImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nombre: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  tipo: { color: '#aaa', fontSize: 14, marginBottom: 20 },
  infoBox: {
    backgroundColor: '#1f1f1f',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { color: '#888', fontSize: 16 },
  value: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
