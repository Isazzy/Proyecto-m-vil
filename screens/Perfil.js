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
  ActivityIndicator,
} from 'react-native';
import React, { useRef } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AnimatedReanimated, { FadeInDown } from 'react-native-reanimated';
import { signOut } from 'firebase/auth';
import ChangePasswordForm from './ChangePasswordForm';
import { LinearGradient } from 'expo-linear-gradient';
import useUserDoc from '../src/config/hooks/useUserDoc';
import { auth } from '../src/config/firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const { user, userDoc, loading } = useUserDoc({ realtime: true });
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.log('Error al cerrar sesión:', e);
    }
  };

  // PanResponder del modal (tal cual tenías)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideAnim.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          Animated.timing(slideAnim, { toValue: height, duration: 200, useNativeDriver: true }).start(() => {
            setShowPasswordModal(false);
            slideAnim.setValue(0);
          });
        } else {
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const handleCloseModal = () => {
    Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }).start(() => {
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

  const fullName = `${userDoc?.nombre || ''} ${userDoc?.apellido || ''}`.trim();
  const photoURL = userDoc?.photoURL || user?.photoURL || 'https://via.placeholder.com/150';

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <AnimatedReanimated.Image
          entering={FadeInDown.duration(1000)}
          source={require('../assets/fondoPerfil.jpg')}
          style={styles.fondo}
        />

        {/* ← Botón Volver al Home */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesome name="chevron-left" size={18} color="#fff" />
          </TouchableOpacity>
          
        </View>

        {loading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#ff5b5b" />
            <Text style={{ color: '#fff', marginTop: 10 }}>Cargando perfil...</Text>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Image source={{ uri: photoURL }} style={styles.profileImage} />
              <Text style={styles.name}>{fullName || '—'}</Text>
              <Text style={styles.email}>{user?.email || '—'}</Text>
            </View>

            <View style={styles.body}>
              <LinearGradient
                colors={['#f77f83ff', '#f6416c', '#43073dff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              />
              <Text style={styles.infoText}>Teléfono: {userDoc?.telefono || ''}</Text>
              <Text style={styles.infoText}>Edad: {userDoc?.edad || ''}</Text>
              <Text style={styles.infoText}>Sexo: {userDoc?.sexo || ''}</Text>
              <Text style={styles.infoText}>
                Fecha de nacimiento:{' '}
                {userDoc?.fechaNacimiento?.toDate
                  ? userDoc.fechaNacimiento.toDate().toLocaleDateString('es-ES')
                  : ''}
              </Text>
              {!userDoc && (
                <Text style={[styles.infoText, { marginTop: 8, color: '#ffbaba' }]}>
                  Aún no completaste tu perfil. Tocá “Editar Perfil”.
                </Text>
              )}
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
              <TouchableOpacity style={styles.button1} onPress={handleLogout}>
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* MODAL */}
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
                  style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}
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
  container: { flex: 1, alignItems: 'center', paddingHorizontal: width * 0.08, paddingVertical: height * 0.04, backgroundColor: '#131111ff' ,marginTop:0},
  fondo: { position: 'absolute', width: width * 1.1, height: height * 0.3, opacity: 0.2 },
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10  },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#9c6e6eff', marginBottom: 8 },
  name: { color: '#fb5b5b', fontSize: width * 0.06, fontWeight: 'bold' },
  email: { color: '#9c6e6eff', fontSize: width * 0.04, marginBottom: 10 },
  body: { backgroundColor: '#131111ff', opacity: 0.9, borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1, alignSelf: 'center' },
  infoText: { color: '#fff', fontSize: width * 0.045, marginBottom: 8 },
  optionsContainer: { backgroundColor: '#131111ff', borderRadius: 16, width: '100%', paddingVertical: 5 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 18, borderBottomWidth: 0.3, borderBottomColor: '#b6cfe0ff' },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionText: { color: '#fff', fontSize: width * 0.045, marginLeft: 14 },
  card: { padding: 1, borderRadius: 20, width: width * 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  containerBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  button1: { backgroundColor: '#ff5b5b', borderRadius: 10, alignItems: 'center', padding: 10, width: 150 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#181515ff', padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, minHeight: 400 },
  dragIndicator: { width: 60, height: 5, backgroundColor: '#666', borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  topBar: {
  position: 'absolute',
  top: 18,               // ajustá si necesitás más espacio
  left: 16,
  right: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  zIndex: 10,
},
backButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: 'rgba(0,0,0,0.35)',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: 'rgba(255,255,255,0.2)',
},
topTitle: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},
});
