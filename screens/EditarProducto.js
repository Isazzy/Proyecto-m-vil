import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  Alert, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import SelectorTipo from '../src/config/componentes/selectores/SelectorTipo';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/diqndk92p/upload';
const UPLOAD_PRESET = 'mitiempo_mobile';

const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#5B5BFB',
};

export default function EditarProducto({ route, navigation }) {
  const { item } = route.params;

  const [nombre, setNombre] = useState(item.nombre);
  const [precio, setPrecio] = useState(item.precio.toString());
  const [tipo, setTipo] = useState(item.tipo);
  const [cantidad, setCantidad] = useState(item.cantidad.toString());
  const [marca, setMarca] = useState(item.marca || '');
  const [stockMinimo, setStockMinimo] = useState(item.stockMinimo?.toString() || '');
  const [activo, setActivo] = useState(item.activo ?? true);
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

  const subirImagenACloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: 'producto.jpg' });
    formData.append('upload_preset', UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Error al subir imagen');
    return data.secure_url;
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !precio.trim() || !tipo.trim() || !cantidad.trim()) {
      return Alert.alert('Campos Incompletos', 'Por favor completa todos los campos obligatorios (*).');
    }

    try {
      setLoading(true);
      let url = imagen;

      if (nuevaImagen && imagen) {
        url = await subirImagenACloudinary(imagen);
      }

      const docRef = doc(db, 'productos', item.id);
      await updateDoc(docRef, {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        tipo,
        cantidad: parseInt(cantidad),
        marca: marca.trim(),
        stockMinimo: parseInt(stockMinimo) || 0,
        activo,
        imagen: url,
      });

      Alert.alert('Éxito', 'Producto actualizado correctamente');
      navigation.goBack();
    } catch (err) {
      console.error('Error al actualizar:', err);
      Alert.alert('Error', 'No se pudo actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    const isDirty =
      nombre.trim() !== item.nombre ||
      precio.trim() !== item.precio.toString() ||
      tipo.trim() !== item.tipo ||
      cantidad.trim() !== item.cantidad.toString() ||
      marca.trim() !== (item.marca || '') ||
      stockMinimo.trim() !== (item.stockMinimo?.toString() || '') ||
      activo !== (item.activo ?? true) ||
      nuevaImagen === true;

    if (!isDirty) return navigation.goBack();

    Alert.alert(
      'Descartar Cambios',
      '¿Seguro que quieres salir? Se perderán los cambios no guardados.',
      [
        { text: 'Quedarse', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.titulo}>Editar Producto</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={50} color={COLORES.textoSecundario} />
              <Text style={styles.imagePlaceholderTexto}>Seleccionar imagen</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nombre <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Esmalte Top Coat"
          placeholderTextColor={COLORES.textoSecundario}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Vogue"
          placeholderTextColor={COLORES.textoSecundario}
          value={marca}
          onChangeText={setMarca}
        />

        <Text style={styles.label}>Precio <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 2500"
          placeholderTextColor={COLORES.textoSecundario}
          keyboardType="numeric"
          value={precio}
          onChangeText={setPrecio}
        />

        <Text style={styles.label}>Categoría <Text style={styles.asterisco}>*</Text></Text>
        <SelectorTipo tipoSeleccionado={tipo} onSelectTipo={setTipo} />

        <Text style={styles.label}>Cantidad (Stock actual) <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 50"
          placeholderTextColor={COLORES.textoSecundario}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />

        <Text style={styles.label}>Stock mínimo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 5"
          placeholderTextColor={COLORES.textoSecundario}
          keyboardType="numeric"
          value={stockMinimo}
          onChangeText={setStockMinimo}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Activo</Text>
          <Switch
            value={activo}
            onValueChange={setActivo}
            trackColor={{ false: '#555', true: COLORES.acentoAzul }}
            thumbColor={activo ? '#fff' : '#ccc'}
          />
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar} disabled={loading}>
            <Text style={styles.btnTexto}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGuardar} onPress={handleGuardar} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORES.textoPrincipal} /> : <Text style={styles.btnTexto}>Actualizar</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORES.fondo },
  scrollContainer: { flexGrow: 1, padding: 20 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: COLORES.textoPrincipal, textAlign: 'center', marginBottom: 24 },
  imageContainer: { alignItems: 'center', marginBottom: 24 },
  image: { width: 160, height: 160, borderRadius: 16, borderWidth: 1, borderColor: COLORES.acentoAzul },
  imagePlaceholder: {
    width: 160, height: 160, borderRadius: 16, borderWidth: 2, borderColor: COLORES.superficie,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORES.superficie,
  },
  imagePlaceholderTexto: { color: COLORES.textoSecundario, marginTop: 8 },
  label: { fontSize: 14, color: COLORES.textoPrincipal, marginBottom: 8, marginTop: 10 },
  asterisco: { color: COLORES.acentoPrincipal },
  input: {
    backgroundColor: COLORES.superficie, color: COLORES.textoPrincipal, borderRadius: 16,
    padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORES.superficie,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  btnGuardar: {
    backgroundColor: COLORES.acentoAzul, padding: 14, borderRadius: 16,
    flex: 1, alignItems: 'center', marginLeft: 8,
  },
  btnCancelar: {
    backgroundColor: COLORES.superficie, padding: 14, borderRadius: 16,
    flex: 1, alignItems: 'center', marginRight: 8,
  },
  btnTexto: { color: COLORES.textoPrincipal, fontWeight: 'bold', fontSize: 16 },
});
