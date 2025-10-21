import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert, ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, firestore } from '../src/config/firebaseConfig'; // Importa firestore aquí
import { updateProfile } from 'firebase/auth';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';

import { doc, setDoc, getDoc } from 'firebase/firestore'; // funciones Firestore

const { width, height } = Dimensions.get('window');

const CLOUD_NAME = 'diqndk92p';
const UPLOAD_PRESET = 'mitiempo_mobile';

export default function EditarPerfil({ navigation }) {
  const [localImage, setLocalImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Inputs para datos
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('masculino');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      if (auth.currentUser) {
        const displayName = auth.currentUser.displayName || '';
        const parts = displayName.split(' ');
        setNombre(parts[0] || '');
        setApellido(parts.slice(1).join(' ') || '');
        setLocalImage(auth.currentUser.photoURL || null);

        // Cargar datos extras de Firestore
        try {
          const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTelefono(data.telefono || '');
            setEdad(data.edad ? data.edad.toString() : '');
            setSexo(data.sexo || 'masculino');
            setFechaNacimiento(data.fechaNacimiento ? data.fechaNacimiento.toDate() : new Date());
          }
        } catch (error) {
          console.log('Error cargando datos Firestore', error);
        }
      }
    };

    loadUserData();
  }, []);

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar una foto.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      setLocalImage(uri);
    } catch (e) {
      console.log('openCamera error', e);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  const uriToFileType = (uri) => {
    const extension = uri.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'image/jpeg';
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const uriParts = uri.split('/');
      const fileName = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: uriToFileType(uri),
        name: fileName,
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.log('Cloudinary error', data);
        throw new Error(data?.error?.message || 'Error subiendo imagen');
      }

      const secureUrl = data.secure_url;
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: secureUrl });
        Alert.alert('Éxito', 'Foto de perfil actualizada correctamente.');
        navigation.goBack();
      }
    } catch (err) {
      console.log('uploadImage error', err);
      Alert.alert('Error al subir', err.message || 'Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio.');
      return;
    }
    if (!apellido.trim()) {
      Alert.alert('Error', 'El apellido es obligatorio.');
      return;
    }

    try {
      if (auth.currentUser) {
        // Actualizar nombre y apellido en auth
        await updateProfile(auth.currentUser, {
          displayName: `${nombre.trim()} ${apellido.trim()}`,
        });

        // Guardar en Firestore
        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, {
          telefono,
          edad: Number(edad) || null,
          sexo,
          fechaNacimiento,
        }, { merge: true });

        Alert.alert('Éxito', 'Perfil actualizado correctamente.');
        navigation.goBack();
      }
    } catch (err) {
      console.log('Error actualizando perfil', err);
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={openCamera} disabled={uploading}>
        {localImage ? (
          <Image source={{ uri: localImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholder}>
            <FontAwesome name="camera" size={60} color="#666" />
            <Text style={{ color: '#666', marginTop: 10 }}>Tomar Foto</Text>
          </View>
        )}
        {uploading && (
          <View style={styles.overlayUploading}>
            <ActivityIndicator size="large" color="#ff5b5b" />
          </View>
        )}
      </TouchableOpacity>

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
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />

      <TextInput
        style={styles.input}
        placeholder="Edad"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={edad}
        onChangeText={setEdad}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Sexo:</Text>
        <Picker
          selectedValue={sexo}
          onValueChange={(itemValue) => setSexo(itemValue)}
          style={styles.picker}
          dropdownIconColor="#ff5b5b"
        >
          <Picker.Item label="Masculino" value="masculino" />
          <Picker.Item label="Femenino" value="femenino" />
        </Picker>
      </View>

      <TouchableOpacity onPress={() => setOpenDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Fecha de nacimiento: {fechaNacimiento.toLocaleDateString()}</Text>
      </TouchableOpacity>

      <DatePicker
        modal
        mode="date"
        open={openDatePicker}
        date={fechaNacimiento}
        onConfirm={(date) => {
          setOpenDatePicker(false);
          setFechaNacimiento(date);
        }}
        onCancel={() => setOpenDatePicker(false)}
        maximumDate={new Date()}
      />

      <TouchableOpacity
        style={[styles.button, uploading && { backgroundColor: '#999' }]}
        onPress={() => {
          if (localImage) uploadImage(localImage);
          else handleSaveProfile();
        }}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>{localImage ? 'Subir Foto' : 'Guardar Perfil'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.06,
    backgroundColor: '#181515ff',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: width * 0.07,
    fontWeight: 'bold',
    marginBottom: height * 0.04,
  },
  imageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#ff5b5b',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayUploading: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#242121',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: width * 0.045,
    marginBottom: height * 0.015,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#242121',
    borderRadius: 8,
    marginBottom: height * 0.015,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  pickerLabel: {
    color: '#aaa',
    fontSize: width * 0.04,
    marginBottom: 4,
  },
  picker: {
    color: '#fff',
    width: '100%',
  },
  dateButton: {
    backgroundColor: '#242121',
    paddingVertical: height * 0.015,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: height * 0.025,
    width: '100%',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
  },
  button: {
    backgroundColor: '#ff5b5b',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    borderRadius: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
    textAlign: 'center',
  },
});
