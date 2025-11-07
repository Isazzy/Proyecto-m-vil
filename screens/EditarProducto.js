import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert,
  SafeAreaView, 
  StatusBar,    
  ScrollView,  
  ActivityIndicator, 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../src/config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SelectorTipo from '../src/config/componentes/selectores/SelectorTipo';

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
    if (!nombre.trim() || !precio.trim() || !tipo.trim() || !cantidad.trim()) {
      return Alert.alert('Campos Incompletos', 'Por favor completa todos los campos obligatorios (*).');
    }

    try {
      setLoading(true);
      let url = imagen;
      // Solo sube la imagen si se seleccionó una nueva
      if (nuevaImagen && imagen) {
        url = await subirImagen(imagen);
      }

      const docRef = doc(db, 'productos', item.id);
      await updateDoc(docRef, {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        tipo,
        cantidad: parseInt(cantidad),
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
    // Comprueba si el estado actual es DIFERENTE al 'item' original
    const isDirty = 
      nombre.trim() !== item.nombre || 
      precio.trim() !== item.precio.toString() || 
      tipo.trim() !== item.tipo || 
      cantidad.trim() !== item.cantidad.toString() || 
      nuevaImagen === true; // Si se cambió la imagen

    if (!isDirty) {
      navigation.goBack(); // Si no hay cambios, solo vuelve
      return;
    }

    // Si hay cambios, pregunta
    Alert.alert(
      'Descartar Cambios',
      '¿Seguro que quieres salir? Se perderán los cambios no guardados.',
      [
        { text: 'Quedarse', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.goBack(), // Vuelve y descarta
        }
      ]
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Editar Producto</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imagen ? (
            <Image source={{ uri: imagen }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={50} color={COLORES.textoSecundario} />
              <Text style={styles.imagePlaceholderTexto}>Cambiar imagen</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* --- CAMPO NOMBRE --- */}
        <Text style={styles.label}>Nombre <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Esmalte Top Coat"
          placeholderTextColor={COLORES.textoSecundario}
          value={nombre}
          onChangeText={setNombre}
        />

        {/* --- CAMPO PRECIO --- */}
        <Text style={styles.label}>Precio <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 2500"
          placeholderTextColor={COLORES.textoSecundario}
          keyboardType="numeric"
          value={precio}
          onChangeText={setPrecio}
        />
        
        {/* --- CAMBIO: Usamos Picker para consistencia --- */}
        <Text style={styles.label}>Categoría <Text style={styles.asterisco}>*</Text></Text>
        <SelectorTipo 
          tipoSeleccionado={tipo}
          onSelectTipo={setTipo}
        />

        {/* --- CAMPO CANTIDAD --- */}
        <Text style={styles.label}>Cantidad (Stock) <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 50"
          placeholderTextColor={COLORES.textoSecundario}
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />

        {/* --- BOTONES DE ACCIÓN (Cancel/Guardar) --- */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.btnCancelar} 
            onPress={handleCancelar}
            disabled={loading}
          >
            <Text style={styles.btnTexto}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.btnGuardar} 
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORES.textoPrincipal} />
            ) : (
              <Text style={styles.btnTexto}>Actualizar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// --- ESTILOS "NEÓN OSCURO" (Idénticos a AgregarProducto) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    textAlign: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.acentoAzul, // Borde azul para diferenciar
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORES.superficie,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
  },
  imagePlaceholderTexto: {
    color: COLORES.textoSecundario,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: COLORES.textoPrincipal,
    marginBottom: 8,
    marginTop: 10,
  },
  asterisco: {
    color: COLORES.acentoPrincipal,
  },
  input: {
    backgroundColor: COLORES.superficie,
    color: COLORES.textoPrincipal,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  btnGuardar: {
    backgroundColor: COLORES.acentoAzul, // Usamos el azul para "Actualizar"
    padding: 14,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  btnCancelar: {
    backgroundColor: COLORES.superficie,
    padding: 14,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  btnTexto: {
    color: COLORES.textoPrincipal,
    fontWeight: 'bold',
    fontSize: 16,
  },
});