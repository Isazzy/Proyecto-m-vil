// Profile.jsx (componente completo - reemplaza tu versión)
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';
import { updateProfile, signOut } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

const CLOUD_NAME = 'diqndk92p'; 
const UPLOAD_PRESET = 'mitiempo_mobile'; 

export default function Profile({ navigation }) {
  const [user, loadingUser, errorUser] = useAuthState(auth);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null); 


  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;
      const uri = result.assets[0].uri;
      setLocalImage(uri);
      
    } catch (e) {
      console.log('pickImage error', e);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
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
      formData.append('upload_preset', UPLOAD_PRESET)

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
        },
      });

      const data = await res.json();
      if (!res.ok) {
        console.log('Cloudinary error', data);
        throw new Error(data?.error?.message || 'Error subiendo imagen');
      }

      const secureUrl = data.secure_url;
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: secureUrl });
      }
    } catch (err) {
      console.log('uploadImage error', err);
      Alert.alert('Error al subir', err.message || 'Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (e) {
      Alert.alert('Error', 'No se pudo cerrar sesión.');
    }
  };

  const options = [
    { icon: 'pencil', text: 'Editar Perfil' },
    { icon: 'bell', text: 'Notificaciones' },
    { icon: 'a', text: 'Accesibilidad' },
    { icon: 'lock', text: 'Cambiar Contraseña' },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Animated.Image
            entering={FadeInDown.duration(1000)}
            source={require('../assets/fondoPerfil.jpg')}
            style={styles.fondo}
          />
        </View>

        <Animated.View entering={FadeInDown.duration(1200)} style={styles.header}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            <Image
              source={{ uri: localImage || user?.photoURL || 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            {uploading && (
              <View style={styles.overlayUploading}>
                <ActivityIndicator size="small" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerLeft}>
            <Text numberOfLines={2} style={styles.name}>
              {user ? `${user.displayName?.split(' ')[0] || user.email?.split('@')[0]}` : ''}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {options.map((item, index) => (
            <TouchableOpacity key={index} style={styles.option}>
              <View style={styles.optionLeft}>
                <FontAwesome name={item.icon} size={20} color="#ff5b5b" />
                <Text style={styles.optionText}>{item.text}</Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#aaa" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <FontAwesome name="sign-out" size={18} color="#fff" />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: '#181515ff',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    opacity: 0.2,
    overflow: 'hidden',
  },
  fondo: {
    width: width * 1.1,
    height: height * 0.3,
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.03,
    marginBottom: height * 0.04,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    borderWidth: 2,
    marginBottom: 1,
  },
  overlayUploading: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: width * 0.06,
    fontWeight: 'bold',
  },
  optionsContainer: {
    backgroundColor: '#242121',
    borderRadius: 16,
    width: '100%',
    paddingVertical: 5,
    marginBottom: 25,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 0.3,
    borderBottomColor: '#333',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: '#fff',
    fontSize: width * 0.045,
    marginLeft: 14,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5b5b',
    paddingVertical: height * 0.018,
    borderRadius: 50,
    width: '100%',
    marginTop: height * 0.02,
  },
  signOutText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '500',
    marginLeft: 8,
  },
});
