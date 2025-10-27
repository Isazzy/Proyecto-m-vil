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
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AnimatedReanimated, { FadeInDown } from 'react-native-reanimated';
import { auth, firestore } from '../src/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import ChangePasswordForm from './ChangePasswordForm';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; // para animar arrastre

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) setUserData(docSnap.data());
      } catch (error) {
        console.log('Error cargando info usuario:', error);
      }
    };
    cargarUsuario();
  }, []);

  // === PanResponder para permitir arrastrar hacia abajo ===
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
          // si arrastra más de 120px, cerrar modal
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

  const options = [
    { icon: 'pencil', text: 'Editar Perfil', action: () => navigation.navigate('EditarPerfil') },
    { icon: 'bell', text: 'Notificaciones' },
    { icon: 'universal-access', text: 'Accesibilidad' },
    { icon: 'lock', text: 'Cambiar Contraseña', action: () => setShowPasswordModal(true) },
    { icon: 'cog', text: 'Configuración' },
    { icon: 'question-circle', text: 'Ayuda' },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <AnimatedReanimated.Image
          entering={FadeInDown.duration(1000)}
          source={require('../assets/fondoPerfil.jpg')}
          style={styles.fondo}
        />

        <View style={styles.header}>
          <Image
            source={{ uri: userData?.photoURL || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>
            {userData?.nombre || ''} {userData?.apellido || ''}
          </Text>
          <Text style={styles.email}>{auth.currentUser?.email || '-'}</Text>
        </View>

        <View style={styles.body}>
          <LinearGradient
            colors={['#f77f83ff', '#f6416c', '#43073dff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          />
          <Text style={styles.infoText}>Teléfono: {userData?.telefono || ''}</Text>
          <Text style={styles.infoText}>Edad: {userData?.edad || ''}</Text>
          <Text style={styles.infoText}>Sexo: {userData?.sexo || ''}</Text>
          <Text style={styles.infoText}>
            Fecha de nacimiento:{' '}
            {userData?.fechaNacimiento?.toDate
              ? userData.fechaNacimiento.toDate().toLocaleDateString('es-ES')
              : ''}
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((item, index) => (
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
          <TouchableOpacity style={styles.button1} onPress={() => navigation.navigate('Login')}>
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
  body: {
    backgroundColor: '#131111ff',
    opacity: 0.9,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    alignSelf: 'center',
  },
  infoText: { color: '#fff', fontSize: width * 0.045, marginBottom: 8 },
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
  containerBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  button1: {
    backgroundColor: '#413939ff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    width: 150,
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
});
