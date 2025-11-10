import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Switch
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import SelectorTipo from '../src/config/componentes/selectores/SelectorTipo';

const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#5B5BFB',
  acentoVerde: '#5BFB5B',
};

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/diqndk92p/image/upload';
const UPLOAD_PRESET = 'mitiempo_mobile';

export default function AgregarProducto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [marca, setMarca] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipo, setTipo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [activo, setActivo] = useState(true);
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso requerido', 'Debes permitir acceso a la galería.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  const subirImagenACloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'producto.jpg',
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Error al subir imagen');
    return data.secure_url;
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !precio.trim() || !tipo.trim() || !cantidad.trim() || !marca.trim() || !stockMinimo.trim()) {
      return Alert.alert('Campos Incompletos', 'Por favor completa todos los campos obligatorios (*).');
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imagen) {
        imageUrl = await subirImagenACloudinary(imagen);
      }

      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        marca: marca.trim(),
        precio: parseFloat(precio),
        tipo,
        cantidad: parseInt(cantidad),
        stockMinimo: parseInt(stockMinimo),
        activo,
        imagen: imageUrl,
      });

      Alert.alert('Éxito', 'Producto guardado correctamente.');
      navigation.goBack();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    const isDirty = 
      nombre.trim() !== '' || 
      marca.trim() !== '' ||
      precio.trim() !== '' || 
      tipo.trim() !== '' || 
      cantidad.trim() !== '' ||
      stockMinimo.trim() !== '' ||
      imagen !== null;

    if (!isDirty) return navigation.goBack();

    Alert.alert(
      'Descartar Cambios',
      '¿Seguro que quieres salir? Se perderán los datos que no guardaste.',
      [
        { text: 'Quedarse', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Agregar Producto</Text>

        <TouchableOpacity style={styles.imageContainer} onPress={seleccionarImagen}>
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

        <Text style={styles.label}>Marca <Text style={styles.asterisco}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Vogue, L'Oréal..."
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

        <Text style={styles.label}>Stock Mínimo <Text style={styles.asterisco}>*</Text></Text>
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
            thumbColor={activo ? COLORES.acentoVerde : COLORES.acentoPrincipal}
            trackColor={{ false: '#555', true: '#333' }}
          />
        </View>

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
              <Text style={styles.btnTexto}>Guardar</Text>
            )}
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
  image: { width: 160, height: 160, borderRadius: 16, borderWidth: 1, borderColor: COLORES.acentoPrincipal },
  imagePlaceholder: { width: 160, height: 160, borderRadius: 16, borderWidth: 2, borderColor: COLORES.superficie, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORES.superficie },
  imagePlaceholderTexto: { color: COLORES.textoSecundario, marginTop: 8 },
  label: { fontSize: 14, color: COLORES.textoPrincipal, marginBottom: 8, marginTop: 10 },
  asterisco: { color: COLORES.acentoPrincipal },
  input: { backgroundColor: COLORES.superficie, color: COLORES.textoPrincipal, borderRadius: 16, padding: 12, fontSize: 16, borderWidth: 1, borderColor: COLORES.superficie },
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  btnGuardar: { backgroundColor: COLORES.acentoPrincipal, padding: 14, borderRadius: 16, flex: 1, alignItems: 'center', marginLeft: 8 },
  btnCancelar: { backgroundColor: COLORES.superficie, padding: 14, borderRadius: 16, flex: 1, alignItems: 'center', marginRight: 8 },
  btnTexto: { color: COLORES.textoPrincipal, fontWeight: 'bold', fontSize: 16 },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
});
