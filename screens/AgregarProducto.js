// AgregarProducto.js (UI mejorada, validaciones, createdAt)
import React, { useState, useMemo, useCallback} from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Alert,
  SafeAreaView, // --- NUEVO ---
  StatusBar, // --- NUEVO ---
  ActivityIndicator, // --- NUEVO ---
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import SelectorTipo from '../src/config/componentes/selectores/SelectorTipo';

// --- PALETA DE COLORES "NEÓN OSCURO" ---
const COLORES = {
  fondo: '#000000',
  superficie: '#190101', // Tailwind-950 (Casi negro para "tarjetas")
  textoPrincipal: '#FEE6E6', // Tailwind-50 (Blanco cálido)
  textoSecundario: '#A0A0A0', // Gris neutral
  
  acentoPrincipal: '#FB5B5B', // Tu color
  acentoAzul: '#5B5BFB',     // Triádica
  acentoVerde: '#5BFB5B',   // Triádica
};

export default function AgregarProducto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');      // texto para poder formatear
  const [tipo, setTipo] = useState('');
  const [cantidad, setCantidad] = useState('');  // texto para formateo
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false); // --- NUEVO: Estado de carga ---

  // ---------- Helpers de formato ----------
  const sanitizePrecio = (val) => {
    // deja solo números y un punto
    const cleaned = val.replace(/[^0-9.]/g, '');
    // si hay más de un punto, quita los extra
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    return cleaned;
  };
  const sanitizeCantidad = (val) => val.replace(/[^0-9]/g, '');

  const precioNumber = useMemo(() => {
    const n = parseFloat(precio);
    return Number.isFinite(n) ? n : NaN;
  }, [precio]);

  const cantidadNumber = useMemo(() => {
    const n = parseInt(cantidad, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [cantidad]);

  // ---------- Selección de imagen ----------
  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso requerido', 'Debes permitir acceso a la galería.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImagen(result.assets[0].uri);
  };

  const quitarImagen = () => setImagen(null);

  // ---------- Validaciones ----------
  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!tipo.trim()) e.tipo = 'Seleccioná un tipo.';
    if (!precio.trim() || isNaN(precioNumber) || precioNumber < 0) e.precio = 'Ingresá un precio válido.';
    if (!cantidad.trim() || isNaN(cantidadNumber) || cantidadNumber < 0) e.cantidad = 'Ingresá una cantidad válida.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Guardar ----------
  const handleGuardar = async () => {
    // Verificación de campos obligatorios
    if (!nombre.trim() || !precio.trim() || !tipo.trim() || !cantidad.trim()) {
      return Alert.alert('Campos Incompletos', 'Por favor completa todos los campos obligatorios (*).');
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'productos'), {
        nombre: nombre.trim(),
        precio: parseFloat(precio),
        tipo,
        cantidad: parseInt(cantidad),
        imagen: imagen, // guardamos el URI (luego veremos cómo subirlo a Storage)
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

  // --- NUEVO: Lógica para "Cancelar" ---
  const handleCancelar = () => {
    // Comprueba si algún campo tiene datos
    const isDirty = 
      nombre.trim() !== '' || 
      precio.trim() !== '' || 
      tipo.trim() !== '' || 
      cantidad.trim() !== '' || 
      imagen !== null;

    if (!isDirty) {
      navigation.goBack(); // Si no hay cambios, solo vuelve
      return;
    }

    // Si hay cambios, pregunta
    Alert.alert(
      'Descartar Cambios',
      '¿Seguro que quieres salir? Se perderán los datos que no guardaste.',
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

        {/* --- CAMPO CATEGORÍA --- */}
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

        {/* --- BOTONES DE ACCIÓN --- */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={styles.btnCancelar} 
            onPress={handleCancelar} // --- CAMBIO ---
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

// --- ESTILOS "NEÓN OSCURO" ---
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
    borderColor: COLORES.acentoPrincipal, // Borde con tu color
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORES.superficie, // Borde sutil
    borderStyle: 'dashed', // Borde punteado
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORES.superficie,
  },
  imagePlaceholderTexto: {
    color: COLORES.textoSecundario,
    marginTop: 8,
  },
  // --- NUEVO: Estilo para etiquetas ---
  label: {
    fontSize: 14,
    color: COLORES.textoPrincipal,
    marginBottom: 8,
    marginTop: 10,
  },
  asterisco: {
    color: COLORES.acentoPrincipal, // Tu color
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
    backgroundColor: COLORES.acentoPrincipal, // Tu color
    padding: 14,
    borderRadius: 16,
    flex: 1, // Ocupa espacio
    alignItems: 'center',
    marginLeft: 8,
  },
  btnCancelar: {
    backgroundColor: COLORES.superficie, // Botón secundario
    padding: 14,
    borderRadius: 16,
    flex: 1, // Ocupa espacio
    alignItems: 'center',
    marginRight: 8,
  },
  btnTexto: {
    color: COLORES.textoPrincipal,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
