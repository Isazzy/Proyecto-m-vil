import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
  SafeAreaView, 
  StatusBar,    
  Pressable,    
  Alert,        
} from 'react-native';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AnimatedReanimated, { FadeInDown } from 'react-native-reanimated';
import { auth, db } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import ChangePasswordForm from './ChangePasswordForm';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#6ba1c1ff',
};

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; 

  const cargarUsuario = useCallback(async () => {
    if (!auth.currentUser) return;
    try { 
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    } catch (error) {
      console.log('Error cargando info usuario:', error);
    }
  }, []);

  useEffect(() => {
    cargarUsuario(); 
    const unsubscribe = navigation.addListener('focus', () => {
      cargarUsuario();
    });
    return unsubscribe;
  }, [navigation, cargarUsuario]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          Animated.timing(slideAnim, {
            toValue: height,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setShowPasswordModal(false);
            slideAnim.setValue(0);
          });
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleCloseModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowPasswordModal(false);
      slideAnim.setValue(0);
    });
  };

  const optionsSeguridad = [
    { icon: 'pencil', text: 'Editar Perfil', action: () => navigation.navigate('EditarPerfil') },
    { icon: 'lock', text: 'Cambiar Contraseña', action: () => setShowPasswordModal(true) },
  ];
  
  const optionsConfig = [
    { icon: 'bell', text: 'Notificaciones', action: () => {} },
    { icon: 'universal-access', text: 'Accesibilidad', action: () => {} },
    { icon: 'cog', text: 'Configuración', action: () => {} },
    { icon: 'question-circle', text: 'Ayuda', action: () => {} },
  ];

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Auth');
          } catch (e) {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: COLORES.fondo}}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AnimatedReanimated.Image
            entering={FadeInDown.duration(1000)}
            source={require('../assets/fondoPerfil.jpg')}
            style={styles.fondo}
          />
          
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome name="chevron-left" size={18} color={COLORES.textoPrincipal} /> 
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Image
              source={
                userData?.photoURL
                  ? { uri: userData.photoURL }
                  : require('../assets/icon.png')
              }
              style={styles.profileImage}
            />
            <Text style={styles.name}>
              {userData?.nombre || ''} {userData?.apellido || ''}
            </Text>
            <Text style={styles.email}>{auth.currentUser?.email || '-'}</Text>
          </View>

          <View style={styles.body}>
            <LinearGradient
              colors={[COLORES.acentoPrincipal, '#f6416c', '#43073dff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            />
            <Text style={styles.infoText}>Teléfono: {userData?.telefono || 'No cargado'}</Text>
            <Text style={styles.infoText}>DNI: {userData?.dni || 'No cargado'}</Text>
            <Text style={styles.infoText}>Género: {userData?.genero || 'No cargado'}</Text>
            <Text style={styles.infoText}>
              Nacimiento:{' '}
              {userData?.fechaNacimiento?.toDate
                ? userData.fechaNacimiento.toDate().toLocaleDateString('es-ES')
                : 'No cargado'}
            </Text>
          </View>

          <Text style={styles.tituloSeccion}>Seguridad</Text>
          <View style={styles.optionsContainer}>
            {optionsSeguridad.map((item, index) => (
              <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
                <View style={styles.optionLeft}>
                  <FontAwesome name={item.icon} size={20} color={COLORES.textoSecundario} />
                  <Text style={styles.optionText}>{item.text}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color={COLORES.textoSecundario} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.tituloSeccion}>Configuración</Text>
          <View style={styles.optionsContainer}>
            {optionsConfig.map((item, index) => (
              <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
                <View style={styles.optionLeft}>
                  <FontAwesome name={item.icon} size={20} color={COLORES.textoSecundario} />
                  <Text style={styles.optionText}>{item.text}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color={COLORES.textoSecundario} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.containerBottom}>
            <TouchableOpacity style={styles.button1} onPress={handleLogout}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={showPasswordModal}
            animationType="fade"
            transparent={true}
            onRequestClose={handleCloseModal}
          >
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <Animated.View
                    style={[
                      styles.modalContent,
                      { transform: [{ translateY: slideAnim }] },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <View style={styles.dragIndicator} />
                    <ChangePasswordForm setShowModal={setShowPasswordModal} />
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: COLORES.fondo,
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
    borderColor: COLORES.acentoAzul,
    marginBottom: 8,
  },
  name: { color: COLORES.acentoPrincipal, fontSize: width * 0.06, fontWeight: 'bold' },
  email: { color: COLORES.superficie, fontSize: width * 0.04, marginBottom: 10 },
  body: {
    backgroundColor: COLORES.superficie,
    opacity: 0.9,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    alignSelf: 'stretch',
  },
  infoText: { color: COLORES.textoPrincipal, fontSize: width * 0.045, marginBottom: 8 },
  tituloSeccion: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORES.acentoPrincipal,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  optionsContainer: {
    borderRadius: 16,
    width: '100%',
    paddingVertical: 5,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderBottomWidth: 0.3,
    borderBottomColor: COLORES.textoPrincipal,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionText: { color: COLORES.textoPrincipal, fontSize: width * 0.045, marginLeft: 14 },
  card: { padding: 1, borderRadius: 20, width: width * 0.6 },
  buttonText: { color: COLORES.textoPrincipal, fontSize: 16, fontWeight: 'bold' },
  containerBottom: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  button1: {
    backgroundColor: COLORES.acentoAzul,
    borderRadius: 10,
    alignItems: 'center',
    padding: 12,
    width: '100%', 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORES.superficie,
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: 400,
  },
  dragIndicator: {
    width: 60,
    height: 5,
    backgroundColor: COLORES.textoSecundario,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  topBar: {
    position: 'absolute',
    top: 45,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    width: '100%',
  },
});
