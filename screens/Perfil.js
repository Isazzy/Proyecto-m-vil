import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AnimatedReanimated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../src/config/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/diqndk92p/upload';
  const UPLOAD_PRESET = 'mitiempo_mobile';

  // Cargar datos de usuario desde Firestore
  const cargarUsuario = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    } catch (error) {
      console.log('Error cargando info usuario:', error);
    }
  }, []);

  useEffect(() => {
    cargarUsuario();
    const unsubscribe = navigation.addListener('focus', cargarUsuario);
    return unsubscribe;
  }, [navigation, cargarUsuario]);

  
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const imageUri = result.assets[0].uri;
        const imageData = new FormData();
        imageData.append('file', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        imageData.append('upload_preset', UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, {
          method: 'POST',
          body: imageData,
        });

        const data = await res.json();

        if (data.secure_url) {
          // Guardar la URL en Firestore
          const userDocRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userDocRef, { photoURL: data.secure_url });
          setUserData(prev => ({ ...prev, photoURL: data.secure_url }));
          Alert.alert('Éxito', 'Tu foto de perfil se actualizó.');
        } else {
          throw new Error('No se recibió una URL válida');
        }
      } catch (error) {
        console.log('Error subiendo imagen:', error);
        Alert.alert('Error', 'No se pudo subir la imagen.');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#131111ff' }}>
      <StatusBar barStyle="light-content" backgroundColor={'#131111ff'} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <AnimatedReanimated.Image
            entering={FadeInDown.duration(1000)}
            source={require('../assets/fondoPerfil.jpg')}
            style={styles.fondo}
          />

          <View style={styles.header}>
            <TouchableOpacity onPress={handleImagePick}>
              <Image
                source={
                  userData?.photoURL
                    ? { uri: userData.photoURL }
                    : require('../assets/icon.png')
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <Text style={styles.name}>
              {userData?.nombre || ''} {userData?.apellido || ''}
            </Text>
            <Text style={styles.email}>{auth.currentUser?.email || '-'}</Text>
          </View>

          <LinearGradient
            colors={['#f77f83ff', '#f6416c', '#43073dff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={{ padding: 10 }}>
              <Text style={styles.infoText}>
                Teléfono: {userData?.telefono || 'No cargado'}
              </Text>
              <Text style={styles.infoText}>
                DNI: {userData?.dni || 'No cargado'}
              </Text>
              <Text style={styles.infoText}>
                Género: {userData?.genero || 'No cargado'}
              </Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>
              {uploading ? 'Subiendo...' : 'Cerrar Sesión'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: '#131111ff',
  },
  fondo: {
    position: 'absolute',
    width: width * 1.1,
    height: height * 0.3,
    opacity: 0.2,
  },
  header: { alignItems: 'center', marginBottom: 20 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#9c6e6eff',
    marginBottom: 8,
  },
  name: { color: '#fb5b5b', fontSize: width * 0.06, fontWeight: 'bold' },
  email: { color: '#9c6e6eff', fontSize: width * 0.04, marginBottom: 10 },
  infoText: { color: '#fff', fontSize: width * 0.045, marginBottom: 8 },
  card: {
    borderRadius: 16,
    width: '100%',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#413939ff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
    width: '100%',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
