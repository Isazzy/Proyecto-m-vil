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
  SafeAreaView, // Añadido para consistencia
  StatusBar,    // Añadido para consistencia
  Pressable,    // Añadido para consistencia
  Alert,        // Añadido para consistencia
} from 'react-native';
// --- CAMBIO: Añadido 'useCallback' ---
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AnimatedReanimated, { FadeInDown } from 'react-native-reanimated';
import { auth, db } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth'; // <-- CAMBIO: Importado 'signOut'
import { doc, getDoc } from 'firebase/firestore';
import ChangePasswordForm from './ChangePasswordForm';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; 

  // --- INICIO DEL CAMBIO: Lógica de actualización automática ---
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
  }, []); // Creamos una función 'cargable'

  useEffect(() => {
    // Se ejecuta la primera vez que entras
    cargarUsuario(); 

    // Y se vuelve a ejecutar CADA VEZ que vuelves a esta pantalla ('focus')
    const unsubscribe = navigation.addListener('focus', () => {
      cargarUsuario();
    });

    return unsubscribe; // Limpiamos el listener
  }, [navigation, cargarUsuario]);
  // --- FIN DEL CAMBIO ---

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

  // --- CAMBIO: Opciones agrupadas como pediste en comentarios ---
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

  // --- CAMBIO: Función de Logout correcta ---
  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Querés cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace('Auth'); // Vuelve al stack de Login
          } catch (e) {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          }
        },
      },
    ]);
  };

  return (
    // --- CAMBIO: Añadido SafeAreaView y StatusBar ---
    <SafeAreaView style={{flex: 1, backgroundColor: '#131111ff'}}>
      <StatusBar barStyle="light-content" backgroundColor={'#131111ff'} />
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
              onPress={() => navigation.goBack()} // <-- CAMBIO: 'goBack()' es más robusto
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome name="chevron-left" size={18} color="#FFF" /> 
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Image
              source={
                // --- CAMBIO: Lee desde 'userData' para la actualización instantánea ---
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

          {/* --- CAMBIO: Caja de Info con campos añadidos --- */}
          <View style={styles.body}>
            <LinearGradient
              colors={['#f77f83ff', '#f6416c', '#43073dff']}
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

          {/* --- CAMBIO: Opciones Agrupadas --- */}
          <Text style={styles.tituloSeccion}>Seguridad</Text>
          <View style={styles.optionsContainer}>
            {optionsSeguridad.map((item, index) => (
              <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
                <View style={styles.optionLeft}>
                  <FontAwesome name={item.icon} size={20} color="#ff5b5b" />
                  <Text style={styles.optionText}>{item.text}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#aaa" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.tituloSeccion}>Configuración</Text>
          <View style={styles.optionsContainer}>
            {optionsConfig.map((item, index) => (
              <TouchableOpacity key={index} style={styles.option} onPress={item.action}>
                <View style={styles.optionLeft}>
                  <FontAwesome name={item.icon} size={20} color="#ff5b5b" />
                  <Text style={styles.optionText}>{item.text}</Text>
                </View>
                <FontAwesome name="chevron-right" size={16} color="#aaa" />
              </TouchableOpacity>
            ))}
          </View>


          <View style={styles.containerBottom}>
            {/* --- CAMBIO: Botón de Salir con función correcta --- */}
            <TouchableOpacity style={styles.button1} onPress={handleLogout}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          {/* === MODAL === */}
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

// --- TUS ESTILOS ORIGINALES (con la corrección de 'body') ---
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
  body: {
    backgroundColor: '#131111ff',
    opacity: 0.9,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    alignSelf: 'stretch', // <-- CORRECCIÓN: Para que ocupe el ancho
  },
  infoText: { color: '#fff', fontSize: width * 0.045, marginBottom: 8 },
  
  // --- TUS ESTILOS PARA OPCIONES ---
  tituloSeccion: { // (Estilo que añadí para agrupar)
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  optionsContainer: {
    backgroundColor: '#131111ff',
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
    borderBottomColor: '#b6cfe0ff',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: width * 0.045, marginLeft: 14 },
  
  card: { padding: 1, borderRadius: 20, width: width * 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  containerBottom: { 
    flexDirection: 'row', 
    justifyContent: 'center', // Centrado, ya que es un solo botón
    width: '100%',
    marginTop: 20, // Espacio
  },
  button1: { // Botón de Cerrar Sesión
    backgroundColor: '#413939ff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 12, // Padding
    width: '100%', // Ancho completo
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#181515ff',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    minHeight: 400,
  },
  dragIndicator: {
    width: 60,
    height: 5,
    backgroundColor: '#666',
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
    width: '100%', // Asegura que ocupe todo el ancho
  },
});