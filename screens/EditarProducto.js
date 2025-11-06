import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../src/config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const tipos = ['Skincare', 'Cabello', 'Uñas', 'Maquillaje', 'Barbería'];

export default function EditarProducto({ route, navigation }) {
  const { item } = route.params;
  const [nombre, setNombre] = useState(item.nombre);
  const [precio, setPrecio] = useState(item.precio.toString());
  const [tipo, setTipo] = useState(item.tipo);
  const [cantidad, setCantidad] = useState(item.cantidad.toString());
  const [imagen, setImagen] = useState(item.imagen || null);
  const [nuevaImagen, setNuevaImagen] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImagen(result.assets[0].uri);
      setNuevaImagen(true);
    }
  };

  const subirImagen = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `productos/${Date.now()}.jpg`;
    const imageRef = ref(storage, filename);
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  const handleGuardar = async () => {
    if (!nombre || !precio || !tipo || !cantidad) {
      return Alert.alert('Error', 'Completa todos los campos');
    }

    try {
      setLoading(true);
      let url = imagen;
      if (nuevaImagen) url = await subirImagen(imagen);

      const docRef = doc(db, 'productos', item.id);
      await updateDoc(docRef, {
        nombre,
        precio: parseFloat(precio),
        tipo,
        cantidad: parseInt(cantidad),
        imagen: url,
      });

      Alert.alert('Éxito', 'Producto actualizado correctamente');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Producto</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.image} />
        ) : (
          <Ionicons name="image-outline" size={48} color="#aaa" />
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Nombre"
        placeholderTextColor="#888"
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        placeholder="Precio"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        value={precio}
        onChangeText={setPrecio}
      />
      <TextInput
        placeholder="Cantidad"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        value={cantidad}
        onChangeText={setCantidad}
      />

      <View style={styles.tipoContainer}>
        {tipos.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tipoBtn, tipo === t && styles.tipoActivo]}
            onPress={() => setTipo(t)}
          >
            <Text style={[styles.tipoText, tipo === t && styles.tipoTextActivo]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btnGuardar, loading && { opacity: 0.5 }]}
        disabled={loading}
        onPress={handleGuardar}
      >
        <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Actualizar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  titulo: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 20 },
  imagePicker: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: { width: 120, height: 120, borderRadius: 10 },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'center',
  },
  tipoBtn: {
    backgroundColor: '#1f1f1f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  tipoActivo: { backgroundColor: '#97c5df' },
  tipoText: { color: '#fff' },
  tipoTextActivo: { color: '#000', fontWeight: '700' },
  btnGuardar: {
    backgroundColor: '#97c5df',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
