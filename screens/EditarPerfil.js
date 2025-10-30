import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, Alert, Platform, ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import useUserDoc from '../src/config/hooks/useUserDoc';
// ⬇️ YA NO USAMOS FIREBASE STORAGE
// import { storage } from '../src/config/firebaseConfig';
import { Timestamp } from 'firebase/firestore';


const { width, height } = Dimensions.get('window');

export default function EditarPerfil({ navigation }) {
  const { user, userDoc, updateUserDoc } = useUserDoc({ realtime: false });

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState(null);
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLocalImage(user?.photoURL || userDoc?.photoURL || null);

    if (userDoc) {
      setNombre(userDoc.nombre || '');
      setApellido(userDoc.apellido || '');
      setTelefono(userDoc.telefono || '');
      setEdad(userDoc.edad ? String(userDoc.edad) : '');
      setSexo(userDoc.sexo || null);
      setFechaNacimiento(
        userDoc.fechaNacimiento?.toDate ? userDoc.fechaNacimiento.toDate() : new Date()
      );
    }
  }, [user, userDoc]);

  const formatFecha = (date) => date.toLocaleDateString('es-ES');

  const cambiarFoto = async () => {
    Alert.alert('Foto de perfil', 'Selecciona una opción', [
      {
        text: 'Sacar foto',
        onPress: async () => {
          const r = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!r.canceled) setLocalImage(r.assets[0].uri);
        },
      },
      {
        text: 'Elegir de galería',
        onPress: async () => {
          const r = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!r.canceled) setLocalImage(r.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // ===========================
  //  CLOUDINARY UPLOAD (sin backend)
  // ===========================
  // ⬇️ Reemplazá estos valores por los tuyos de Cloudinary:
  //    - CLOUDINARY_CLOUD_NAME: Settings → Cloud name
  //    - CLOUDINARY_UPLOAD_PRESET: Upload settings → Upload presets (unsigned)
  //    - CLOUDINARY_FOLDER: (opcional) carpeta destino (p.ej. "users")
  const CLOUDINARY_CLOUD_NAME = 'dkmeubb2v';           // <-- PONÉ TU CLOUD NAME
  const CLOUDINARY_UPLOAD_PRESET = 'romi_fotos';     // <-- PONÉ TU UPLOAD PRESET (unsigned)
  const CLOUDINARY_FOLDER = 'users';                         // opcional

  const guessContentType = (uri, fallback = 'image/jpeg') => {
    const ext = (uri.split('.').pop() || '').toLowerCase();
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    if (ext === 'gif') return 'image/gif';
    return fallback; // jpg/jpeg por defecto
  };

  // Sube imagen local (file://) a Cloudinary y devuelve secure_url
  const uploadToCloudinary = async (localUri) => {
      if (!localUri || !localUri.startsWith('file://')) return localUri;

      const mime = guessContentType(localUri);
      const form = new FormData();

      // 👇 En RN, Cloudinary acepta un "file object" con uri/name/type
      form.append('file', {
        uri: localUri,
        name: 'avatar.' + (mime.split('/')[1] || 'jpg'),
        type: mime,
      });
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      if (CLOUDINARY_FOLDER) form.append('folder', CLOUDINARY_FOLDER);

      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
      const res = await fetch(endpoint, { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok) {
        console.log('Cloudinary error:', json);
        throw new Error(json.error?.message || 'Cloudinary upload failed');
      }
      return json.secure_url;
  };


  
  // Mantiene la interfaz del helper anterior: si hay file:// sube, si ya es http(s) la deja
  // Mantiene la interfaz del helper anterior
  const maybeUploadPhoto = async (_uid, uri) => {
      if (!uri) return null;
      if (uri.startsWith('http')) return uri; // ya es remota
      try {
        console.log('Subiendo a Cloudinary desde:', uri);
        const url = await uploadToCloudinary(uri);
        console.log('URL Cloudinary:', url);
        return url;
      } catch (err) {
        console.log('Upload Cloudinary error:', err?.message);
        throw err;
      }
  };




  const guardarPerfil = async () => {
    if (!nombre.trim() || !apellido.trim() || !sexo) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Error', 'Usuario no autenticado.');
      return;
    }

    try {
      setSaving(true);

      // 1) Sube foto si corresponde (ahora a Cloudinary)
      const photoURL = await maybeUploadPhoto(
        user.uid,
        localImage || user?.photoURL || null
      );

      // 2) Actualiza Firestore + Auth con tu hook
      await updateUserDoc({
        nombre,
        apellido,
        telefono,
        edad: Number(edad) || null,
        sexo,
        fechaNacimiento: Timestamp.fromDate(fechaNacimiento),
        photoURL: photoURL || null,
        displayName: `${nombre} ${apellido}`.trim(),
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar perfil:', error);
      Alert.alert('Error', error?.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#131111ff' }}>
      <Text style={styles.title}>Editar Perfil</Text>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: localImage || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.cameraIcon} onPress={cambiarFoto}>
          <FontAwesome name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        placeholderTextColor="#aaa"
        value={apellido}
        onChangeText={setApellido}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#aaa"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Edad"
        placeholderTextColor="#aaa"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisibility(true)}>
        <Text style={styles.dateButtonText}>
          Fecha de nacimiento: {formatFecha(fechaNacimiento)}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={new Date()}
        date={fechaNacimiento}
        onConfirm={(date) => {
          setFechaNacimiento(date);
          setDatePickerVisibility(false);
        }}
        onCancel={() => setDatePickerVisibility(false)}
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
      />

      <View style={styles.pickerContainer}>
        <Picker selectedValue={sexo} onValueChange={setSexo} style={styles.picker}>
          <Picker.Item label="Seleccionar" value={null} color="#aaa" />
          <Picker.Item label="Masculino" value="masculino" />
          <Picker.Item label="Femenino" value="femenino" />
        </Picker>
      </View>

      <View style={styles.containerBottom}>
        <TouchableOpacity style={styles.button} onPress={guardarPerfil} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button1}
          onPress={() => navigation.navigate('Perfil')}
          disabled={saving}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#ff5b5b' },
  cameraIcon: { position: 'absolute', bottom: 10, right: 105, backgroundColor: '#ff5b5b', padding: 8, borderRadius: 20 },
  input: { backgroundColor: '#242121', color: '#fff', borderRadius: 8, padding: 12, marginBottom: 12 },
  dateButton: { backgroundColor: '#242121', borderRadius: 8, padding: 12, marginBottom: 12 },
  dateButtonText: { color: '#fff' },
  pickerContainer: { backgroundColor: '#242121', borderRadius: 8, marginBottom: 12 },
  picker: { color: '#fff' },
  containerBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { backgroundColor: '#ff5b5b', padding: 12, paddingVertical: 10, borderRadius: 10, alignItems: 'center', width: 155 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  button1: { backgroundColor: '#413939ff', borderRadius: 10, alignItems: 'center', padding: 12, width: 155 },
});
