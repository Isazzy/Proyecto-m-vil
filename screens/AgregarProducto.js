// AgregarProducto.js (UI mejorada, validaciones, createdAt)
import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  ScrollView, Alert, SafeAreaView, StatusBar, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TIPOS = ['Skincare', 'Cabello', 'Uñas', 'Maquillaje', 'Barbería', 'Otros'];

export default function AgregarProducto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');      // texto para poder formatear
  const [tipo, setTipo] = useState('');
  const [cantidad, setCantidad] = useState('');  // texto para formateo
  const [imagen, setImagen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

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
      if (!validar()) return;

      try {
        setSaving(true);
        const docRef = await addDoc(collection(db, 'productos'), {
          nombre: nombre.trim(),
          precio: precioNumber,
          tipo,
          cantidad: cantidadNumber,
          imagen: imagen ?? null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // ✅ Volver a Productos y forzar refresh + destacar el nuevo
        navigation.navigate('Productos', { refresh: true, highlightId: docRef.id });

      } catch (err) {
        console.error('Error al guardar producto:', err);
        Alert.alert('Error', 'No se pudo guardar el producto.');
      } finally {
        setSaving(false);
      }
  };

  // ---------- UI ----------
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1f1f1f', '#161616']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Productos'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agregar producto</Text>
          <View style={{ width: 34 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Imagen */}
          <View style={styles.imageRow}>
            <TouchableOpacity style={styles.imageContainer} onPress={seleccionarImagen} accessibilityLabel="Seleccionar imagen">
              {imagen ? (
                <Image source={{ uri: imagen }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color="#8a93a0" />
                  <Text style={{ color: '#8a93a0', marginTop: 6 }}>Seleccionar imagen</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.imageActions}>
              <TouchableOpacity style={[styles.smallBtn, styles.smallBtnPrimary]} onPress={seleccionarImagen}>
                <Ionicons name="images-outline" size={16} color="#0e1116" />
                <Text style={styles.smallBtnTextDark}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.smallBtnGhost]} onPress={quitarImagen} disabled={!imagen}>
                <Ionicons name="trash-outline" size={16} color={imagen ? '#ff6b6b' : '#666'} />
                <Text style={[styles.smallBtnText, { color: imagen ? '#ff6b6b' : '#666' }]}>Quitar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nombre */}
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Ej. Serum hidratante"
              placeholderTextColor="#8a93a0"
              value={nombre}
              onChangeText={(t) => {
                setNombre(t);
                if (errors.nombre) setErrors((prev) => ({ ...prev, nombre: undefined }));
              }}
            />
            {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}
          </View>

          {/* Tipo chips */}
          <Text style={styles.label}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {TIPOS.map((t) => {
              const active = tipo === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => {
                    setTipo(t);
                    if (errors.tipo) setErrors((prev) => ({ ...prev, tipo: undefined }));
                  }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {errors.tipo ? <Text style={[styles.errorText, { marginTop: -6 }]}>{errors.tipo}</Text> : null}

          {/* Picker fallback */}
          <View style={styles.pickerContainer}>
            <Picker selectedValue={tipo} onValueChange={setTipo} style={styles.picker} dropdownIconColor="#dbe8f2">
              <Picker.Item label="Seleccionar tipo" value="" color="#8a93a0" />
              {TIPOS.map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>

          {/* Precio y Cantidad */}
          <View style={styles.row2}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.inputAffix}>
                <Text style={styles.prefix}>$</Text>
                <TextInput
                  style={[styles.input, styles.inputNoPadLeft, errors.precio && styles.inputError]}
                  placeholder="0.00"
                  placeholderTextColor="#8a93a0"
                  keyboardType="decimal-pad"
                  value={precio}
                  onChangeText={(t) => {
                    setPrecio(sanitizePrecio(t));
                    if (errors.precio) setErrors((prev) => ({ ...prev, precio: undefined }));
                  }}
                  onBlur={() => {
                    if (!isNaN(precioNumber)) setPrecio(precioNumber.toFixed(2));
                  }}
                />
              </View>
              {errors.precio ? <Text style={styles.errorText}>{errors.precio}</Text> : null}
            </View>

            <View style={{ width: 12 }} />

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Cantidad</Text>
              <View style={styles.inputAffix}>
                <Ionicons name="cube-outline" size={14} color="#8a93a0" style={{ marginLeft: 8, marginRight: 6 }} />
                <TextInput
                  style={[styles.input, styles.inputNoPadLeft, errors.cantidad && styles.inputError]}
                  placeholder="0"
                  placeholderTextColor="#8a93a0"
                  keyboardType="number-pad"
                  value={cantidad}
                  onChangeText={(t) => {
                    setCantidad(sanitizeCantidad(t));
                    if (errors.cantidad) setErrors((prev) => ({ ...prev, cantidad: undefined }));
                  }}
                />
              </View>
              {errors.cantidad ? <Text style={styles.errorText}>{errors.cantidad}</Text> : null}
            </View>
          </View>

          {/* Botones */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.btnGuardar, (saving) && { opacity: 0.8 }]}
              onPress={handleGuardar}
              disabled={saving}
            >
              {saving ? (
                <>
                  <ActivityIndicator size="small" color="#0e1116" />
                  <Text style={[styles.btnTextDark, { marginLeft: 8 }]}>Guardando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#0e1116" />
                  <Text style={[styles.btnTextDark, { marginLeft: 8 }]}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => navigation.goBack()}
              disabled={saving}
            >
              <Ionicons name="close-circle-outline" size={18} color="#dbe8f2" />
              <Text style={{ color: '#dbe8f2', marginLeft: 8, fontWeight: '700' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#121212' },

  // Header
  header: {
    paddingTop: 6,
    paddingBottom: 10,
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
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  // Body
  container: { padding: 16, paddingBottom: 40 },
  imageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  imageContainer: { width: 160, height: 160, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#232b33' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e1e1e',
    borderWidth: 1, borderColor: '#232b33',
  },
  imageActions: { gap: 10, alignItems: 'flex-start' },
  smallBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, height: 38, borderRadius: 10,
    borderWidth: 1,
  },
  smallBtnPrimary: { backgroundColor: '#ff7b7b', borderColor: '#97c5df' },
  smallBtnGhost: { backgroundColor: '#121212', borderColor: '#2a2f36' },
  smallBtnTextDark: { color: '#0e1116', fontWeight: '800' },
  smallBtnText: { color: '#dbe8f2', fontWeight: '700' },

  field: { marginTop: 8, marginBottom: 8 },
  label: { color: '#dbe8f2', marginBottom: 6, fontWeight: '700' },
  input: {
    backgroundColor: '#1a1f24',
    color: '#e6edf3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1, borderColor: '#232b33',
  },
  inputError: { borderColor: '#ff6b6b' },
  errorText: { color: '#ff9d9d', marginTop: 6, fontSize: 12 },

  // Chips Tipo
  chipsRow: { paddingVertical: 6, paddingRight: 6 },
  chip: {
    marginRight: 8,
    backgroundColor: '#1f1f1f',
    borderWidth: 1, borderColor: '#2a2a2a',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: '#97c5df', borderColor: '#97c5df' },
  chipText: { color: '#dbe8f2', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#0e1116' },

  // Picker
  pickerContainer: {
    backgroundColor: '#1a1f24',
    borderWidth: 1, borderColor: '#232b33',
    borderRadius: 12,
    marginTop: 6, marginBottom: 10,
  },
  picker: { color: '#e6edf3' },

  // Precio / Cantidad
  row2: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 },
  inputAffix: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1f24',
    borderWidth: 1, borderColor: '#232b33',
    borderRadius: 12,
    height: 44,
  },
  prefix: { color: '#8a93a0', marginLeft: 12, marginRight: 6, fontWeight: '700' },
  inputNoPadLeft: { flex: 1, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 0 },

  // Botones
  bottomButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  btnGuardar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ff7b7b',
    padding: 12, borderRadius: 10, width: '48%',
  },
  btnCancelar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a1f24',
    padding: 12, borderRadius: 10, width: '48%',
    borderWidth: 1, borderColor: '#232b33',
  },
  btnTextDark: { color: '#fff', fontWeight: '800' },
});
