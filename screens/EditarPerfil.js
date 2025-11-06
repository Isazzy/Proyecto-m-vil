import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Image, Alert, ScrollView, SafeAreaView, StatusBar, 
  ActivityIndicator, Platform
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc, Timestamp, setDoc } from 'firebase/firestore'; 
import { auth, db } from '../src/config/firebaseConfig'; 

import { updateProfile } from 'firebase/auth';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SelectorTipo from '../src/config/componentes/selectores/SelectorTipoG'; // (Asegúrate que la ruta sea correcta)


const CLOUDINARY_CLOUD_NAME = 'diqndk92p';
const CLOUDINARY_UPLOAD_PRESET = 'mitiempo_mobile'; 
const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#6ba1c1ff',
};

const calcularEdad = (fechaNac) => {
  // ... (tu función calcularEdad)
  const hoy = new Date();
  const cumple = new Date(fechaNac);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return edad;
};

export default function EditarPerfil({ navigation }) {
  // (Estados se mantienen)
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState(''); 
  const [telefono, setTelefono] = useState('');
  const [genero, setGenero] = useState(null); 
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [localImage, setLocalImage] = useState(null); 
  const [originalData, setOriginalData] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  
  // (useEffect se mantiene)
  useEffect(() => {
    const cargarDatos = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const initialData = {
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          telefono: data.telefono || '',
          dni: data.dni || '',
          genero: data.genero || null,
          fechaNacimiento: data.fechaNacimiento?.toDate ? data.fechaNacimiento.toDate() : new Date(),
          photoURL: auth.currentUser.photoURL || null,
        };
        
        setNombre(initialData.nombre);
        setApellido(initialData.apellido);
        setTelefono(initialData.telefono);
        setDni(initialData.dni);
        setGenero(initialData.genero);
        setFechaNacimiento(initialData.fechaNacimiento);
        setLocalImage(initialData.photoURL);
        
        setOriginalData(initialData); 
      } else {
        // --- CAMBIO: Si el documento no existe, igual inicializamos originalData ---
        // Esto previene el crash si es un usuario nuevo sin datos en Firestore
        const initialData = {
          nombre: auth.currentUser.displayName ? auth.currentUser.displayName.split(' ')[0] : '',
          apellido: auth.currentUser.displayName ? auth.currentUser.displayName.split(' ')[1] : '',
          telefono: '',
          dni: '',
          genero: null,
          fechaNacimiento: new Date(),
          photoURL: auth.currentUser.photoURL || null,
        };
        setNombre(initialData.nombre);
        setApellido(initialData.apellido);
        setLocalImage(initialData.photoURL);
        setOriginalData(initialData);
        // --- FIN DEL CAMBIO ---
      }
    };
    cargarDatos();
  }, []);
  
  // (formatFecha se mantiene)
  const formatFecha = (date) => {
    if (!date) return 'Seleccionar fecha...';
    const hoy = new Date();
    // --- CAMBIO: Añadida comprobación de 'originalData' ---
    if (date.toDateString() === hoy.toDateString() && !originalData?.fechaNacimiento) {
      return 'Seleccionar fecha...';
    }
    return date.toLocaleDateString('es-ES');
  };

  // (cambiarFoto se mantiene)
  const cambiarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ 
      allowsEditing: true, 
      aspect:[1,1], 
      quality:0.7 
    });
    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  };

  // (subirImagen se mantiene)
  const subirImagen = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: `image/${uri.split('.').pop()}`, 
      name: `upload.${uri.split('.').pop()}`,
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url; 
      } else {
        throw new Error(data.error?.message || 'Error al subir a Cloudinary');
      }
    } catch (err) {
      console.error('Error en subirImagen:', err);
      throw err; 
    }
  };

  const guardarPerfil = async () => {
    // (Validaciones se mantienen)
    if (!nombre.trim() || !apellido.trim() || !genero || !dni.trim()) {
      Alert.alert('Campos Incompletos', 'Completa todos los campos obligatorios (*).');
      return;
    }
    if (!/^\d{7,8}$/.test(dni.trim())) {
      Alert.alert('DNI Inválido', 'El DNI debe tener 7 u 8 números, sin puntos.');
      return;
    }
    const edadCalculada = calcularEdad(fechaNacimiento);
    if (edadCalculada < 13) {
      Alert.alert('Fecha Inválida', 'Debes tener al menos 13 años para registrarte.');
      return;
    }
    if (!auth.currentUser) return Alert.alert('Error', 'Usuario no autenticado.');

    setLoading(true);
    try {
      // --- CAMBIO: Fallback para originalData ---
      // Si originalData es null, usa la foto de auth.currentUser como base
      const originalPhoto = originalData?.photoURL || auth.currentUser?.photoURL || null;
      let finalImageURL = originalPhoto; 

      // Comparamos si la imagen local (nueva) es diferente a la original
      if (localImage && localImage !== originalPhoto) {
        finalImageURL = await subirImagen(localImage); 
      }
      // --- FIN DEL CAMBIO ---
      
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      const datosActualizados = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        dni: dni.trim(),
        genero: genero,
        fechaNacimiento: Timestamp.fromDate(fechaNacimiento),
        photoURL: finalImageURL 
      };

      await setDoc(userDocRef, datosActualizados, { merge: true });

      await updateProfile(auth.currentUser, {
        displayName: `${nombre.trim()} ${apellido.trim()}`,
        photoURL: finalImageURL
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    // --- CAMBIO: Verificación de originalData ---
    if (!originalData) {
      navigation.goBack(); // Si no hay datos cargados, simplemente vuelve
      return;
    }
    // --- FIN DEL CAMBIO ---

    const isDirty = 
      nombre.trim() !== originalData.nombre ||
      apellido.trim() !== originalData.apellido ||
      telefono.trim() !== originalData.telefono ||
      dni.trim() !== originalData.dni ||
      genero !== originalData.genero ||
      localImage !== originalData.photoURL || // Esta línea ahora es segura
      fechaNacimiento.toDateString() !== originalData.fechaNacimiento.toDateString();

    if (!isDirty) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Descartar Cambios',
      '¿Seguro que quieres salir? Se perderán los cambios no guardados.',
      [
        { text: 'Quedarse', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  // (El JSX/return se mantiene 100% igual)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>Editar Perfil</Text>

        <View style={styles.imageContainer}>
          <Image 
            source={localImage ? { uri: localImage } : require('../assets/placeholder.png')} 
            style={styles.profileImage} 
          />
          <TouchableOpacity style={styles.cameraIcon} onPress={cambiarFoto}>
            <FontAwesome name="camera" size={20} color={COLORES.textoPrincipal} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Nombre <Text style={styles.asterisco}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Tu nombre" placeholderTextColor={COLORES.textoSecundario} value={nombre} onChangeText={setNombre} />
        
        <Text style={styles.label}>Apellido <Text style={styles.asterisco}>*</Text></Text>
        <TextInput style={styles.input} placeholder="Tu apellido" placeholderTextColor={COLORES.textoSecundario} value={apellido} onChangeText={setApellido} />
        
        <Text style={styles.label}>DNI <Text style={styles.asterisco}>*</Text></Text>
        <TextInput style={styles.input} placeholder="N° de Documento (sin puntos)" placeholderTextColor={COLORES.textoSecundario} value={dni} onChangeText={setDni} keyboardType="numeric" maxLength={8} />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput style={styles.input} placeholder="Ej: 1122334455" placeholderTextColor={COLORES.textoSecundario} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
        
        <Text style={styles.label}>Fecha de Nacimiento <Text style={styles.asterisco}>*</Text></Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisibility(true)}>
          <Text style={styles.dateButtonText}>{formatFecha(fechaNacimiento)}</Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 13))} 
          date={fechaNacimiento}
          onConfirm={(date) => { setFechaNacimiento(date); setDatePickerVisibility(false); }}
          onCancel={() => setDatePickerVisibility(false)}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          confirmTextIOS="Confirmar"
          cancelTextIOS="Cancelar"
        />

        <Text style={styles.label}>Género <Text style={styles.asterisco}>*</Text></Text>
        <SelectorTipo
          tipoSeleccionado={genero}
          onSelectTipo={setGenero}
        />

        <View style={styles.containerBottom}>
          <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar} disabled={loading}>
            <Text style={styles.btnTexto}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGuardar} onPress={guardarPerfil} disabled={loading}>
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

// (Tus estilos se mantienen 100% igual)
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
    marginBottom: 24, 
    textAlign: 'center' 
  },
  imageContainer: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  profileImage: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    borderWidth: 2, 
    borderColor: COLORES.acentoPrincipal
  },
  cameraIcon: { 
    position: 'absolute',
    bottom: 10, 
    right: (View.width / 2) - 80, // (Esto podría fallar, mejor usar Dimensions)
    backgroundColor: COLORES.acentoAzul, 
    padding: 8, 
    borderRadius: 20 
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
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  dateButton: { 
    backgroundColor: COLORES.superficie, 
    borderRadius: 16, 
    padding: 14, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  dateButtonText: { 
    color: COLORES.textoPrincipal,
    fontSize: 16,
  },
  containerBottom: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 30,
  },
  btnGuardar: { 
    backgroundColor: COLORES.acentoAzul, 
    padding: 14,
    borderRadius: 16, 
    alignItems: 'center', 
    flex: 1,
    marginLeft: 8,
    height: 48, 
    justifyContent: 'center',
  },
  btnTexto: { 
    color: COLORES.textoPrincipal, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  btnCancelar:{ 
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    alignItems: "center",
    padding: 14,
    flex: 1,
    marginRight: 8,
  },
});