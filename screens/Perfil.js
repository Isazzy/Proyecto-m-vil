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
  StatusBar,    
  Pressable,    
  Alert,        
} from 'react-native';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import AnimatedReanimated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { auth, db } from '../src/config/firebaseConfig';
import { signOut } from 'firebase/auth'; 
import { doc, getDoc } from 'firebase/firestore';
import ChangePasswordForm from './ChangePasswordForm';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import useUserDoc from '../src/config/hooks/useUserDoc';


const { width, height } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current;


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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const unsubscribe = navigation.addListener('focus', () => {
      cargarUsuario();
    });

    return unsubscribe;
  }, [navigation, cargarUsuario]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) slideAnim.setValue(g.dy);
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
            navigation.replace('Login'); 
          } catch (e) {
            Alert.alert('Error', 'No se pudo cerrar la sesión.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#0a0909'}}>
      <StatusBar barStyle="light-content" backgroundColor={'#0a0909'} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <AnimatedReanimated.Image
            entering={FadeInDown.duration(1000)}
            source={require('../assets/fondoPerfil.jpg')}
            style={styles.fondo}
          />
          
          {/* Header con gradiente sutil */}
          <LinearGradient
            colors={['rgba(247, 127, 131, 0.15)', 'transparent']}
            style={styles.headerGradient}
          />
          
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()} 
              accessibilityRole="button"
              accessibilityLabel="Volver"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.backButtonInner}>
                <FontAwesome name="chevron-left" size={16} color="#FFF" /> 
              </View>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={['#f77f83', '#f6416c', '#43073d']}
                style={styles.profileImageGradient}
              >
                <Image
                  source={
                    userData?.photoURL
                      ? { uri: userData.photoURL }
                      : require('../assets/icon.png')
                  }
                  style={styles.profileImage}
                />
              </LinearGradient>
              <View style={styles.statusIndicator} />
            </View>
            <Text style={styles.name}>
              {userData?.nombre || ''} {userData?.apellido || ''}
            </Text>
            <View style={styles.emailContainer}>
              <FontAwesome name="envelope" size={12} color="#9c6e6e" style={styles.emailIcon} />
              <Text style={styles.email}>{auth.currentUser?.email || '-'}</Text>
            </View>
          </Animated.View>

          {/* Info Card mejorada */}
          <View style={styles.body}>
            <LinearGradient
              colors={['rgba(247, 127, 131, 0.1)', 'rgba(67, 7, 61, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBackground}
            >
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <FontAwesome name="phone" size={16} color="#f77f83" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{userData?.telefono || 'No cargado'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <FontAwesome name="id-card" size={16} color="#f77f83" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>DNI</Text>
                  <Text style={styles.infoValue}>{userData?.dni || 'No cargado'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <FontAwesome name="user" size={16} color="#f77f83" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Género</Text>
                  <Text style={styles.infoValue}>{userData?.genero || 'No cargado'}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <FontAwesome name="calendar" size={16} color="#f77f83" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Nacimiento</Text>
                  <Text style={styles.infoValue}>
                    {userData?.fechaNacimiento?.toDate
                      ? userData.fechaNacimiento.toDate().toLocaleDateString('es-ES')
                      : 'No cargado'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Sección Seguridad */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.tituloSeccion}>Seguridad</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <View style={styles.optionsContainer}>
              {optionsSeguridad.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.option,
                    index === optionsSeguridad.length - 1 && styles.lastOption
                  ]} 
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name={item.icon} size={18} color="#f77f83" />
                    </View>
                    <Text style={styles.optionText}>{item.text}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <FontAwesome name="chevron-right" size={14} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sección Configuración */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLine} />
              <Text style={styles.tituloSeccion}>Configuración</Text>
              <View style={styles.sectionHeaderLine} />
            </View>
            <View style={styles.optionsContainer}>
              {optionsConfig.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.option,
                    index === optionsConfig.length - 1 && styles.lastOption
                  ]} 
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <View style={styles.iconContainer}>
                      <FontAwesome name={item.icon} size={18} color="#f77f83" />
                    </View>
                    <Text style={styles.optionText}>{item.text}</Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <FontAwesome name="chevron-right" size={14} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botón de cerrar sesión mejorado */}
          <View style={styles.containerBottom}>
            <TouchableOpacity 
              style={styles.button1} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(247, 127, 131, 0.15)', 'rgba(67, 7, 61, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <FontAwesome name="sign-out" size={18} color="#f77f83" style={styles.logoutIcon} />
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

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
                    style={[
                      styles.modalContent,
                      { transform: [{ translateY: slideAnim }] },
                    ]}
                    {...panResponder.panHandlers}
                  >
                    <View style={styles.dragIndicatorContainer}>
                      <View style={styles.dragIndicator} />
                    </View>
                    <ChangePasswordForm setShowModal={setShowPasswordModal} />
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    backgroundColor: '#0a0909',
  },
  fondo: {
    position: 'absolute',
    width: width * 1.2,
    height: height * 0.35,
    opacity: 0.15,
    top: -20,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 24,
    marginTop: 60,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImageGradient: {
    padding: 4,
    borderRadius: 68,
    elevation: 8,
    shadowColor: '#f6416c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#0a0909',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ade80',
    borderWidth: 3,
    borderColor: '#0a0909',
  },
  name: { 
    color: '#fff', 
    fontSize: width * 0.065, 
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 110, 110, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emailIcon: {
    marginRight: 6,
  },
  email: { 
    color: '#9c6e6e', 
    fontSize: width * 0.035,
    fontWeight: '500',
  },
  body: {
    width: '100%',
    marginBottom: 24,
  },
  cardBackground: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 127, 131, 0.2)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(247, 127, 131, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: '#9c6e6e',
    fontSize: width * 0.032,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(156, 110, 110, 0.2)',
    marginVertical: 4,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(156, 110, 110, 0.3)',
  },
  tituloSeccion: { 
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#9c6e6e',
    paddingHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionsContainer: {
    backgroundColor: 'rgba(19, 17, 17, 0.6)',
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(156, 110, 110, 0.2)',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 110, 110, 0.15)',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionLeft: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(247, 127, 131, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: { 
    color: '#fff', 
    fontSize: width * 0.042,
    fontWeight: '500',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerBottom: { 
    width: '100%',
    marginTop: 10,
    marginBottom: 30,
  },
  button1: { 
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 127, 131, 0.3)',
  },
  logoutIcon: {
    marginRight: 10,
  },
  buttonText: { 
    color: '#fff', 
    fontSize: width * 0.042,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#181515',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 400,
    borderTopWidth: 1,
    borderColor: 'rgba(247, 127, 131, 0.2)',
  },
  dragIndicatorContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 50,
    height: 4,
    backgroundColor: 'rgba(156, 110, 110, 0.5)',
    borderRadius: 2,
  },
  topBar: {
    position: 'absolute',
    top: 45,               
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(247, 127, 131, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 127, 131, 0.3)',
  },
});