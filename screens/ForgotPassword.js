import React, { useState, useEffect } from 'react';
import {
  View,
  ImageBackground,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get("window");
export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState(null);

  // Animación del label
  const emailAnim = useSharedValue(0);
  const emailLabelStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 35,
    top: withTiming(emailAnim.value ? -10 : 12, { duration: 200 }),
    fontSize: withTiming(emailAnim.value ? 13 : 16, { duration: 200 }),
    color: emailAnim.value ? '#ff5b5b' : '#aaa',
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(emailAnim.value ? '#ff5b5b' : '#aaa', { duration: 200 }),
  }));

  useEffect(() => {
    if ((typeMessage === "error" || typeMessage === "success") && email) {
      setMessage(null);
      setTypeMessage(null);
    }
  }, [email]);

  const handleResetPassword = () => {
    if (!email) {
      setTypeMessage("error");
      setMessage("Ingresa tu correo electrónico");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setTypeMessage("success");
        setMessage("Si el correo está registrado, le enviaremos un enlace para restablecer la contraseña.\nRevise su bandeja de entrada y Spam.");
      })
      .catch((error) => {
        setTypeMessage("error");
        setMessage("Ha ocurrido un error. Intenta nuevamente más tarde.");
        console.log("Firebase error:", error.code);
      });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require('../assets/fondo.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.overlay} />
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(800)} style={styles.formContainer}>
            
            <Text style={styles.logoText}>Recuperar contraseña</Text>

            <Text style={styles.infoText}>
              Introduce tu correo para recibir el enlace de recuperación.
            </Text>

            {message && (
              <Animated.Text
                entering={FadeInDown.duration(1000)}
                style={[
                  styles.message,
                  typeMessage === "error" ? styles.errorMessage : styles.successMessage
                ]}
              >
                {message}
              </Animated.Text>
            )}

            {/* Input animado */}
            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope" size={20} color="#ff5b5b" style={styles.icon} />
              <Animated.Text style={emailLabelStyle}>Correo electrónico</Animated.Text>
              <TextInput
                style={styles.input}
                placeholder=""
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => emailAnim.value = 1}
                onBlur={() => emailAnim.value = email.trim() !== '' ? 1 : 0}
              />
              <Animated.View style={[styles.underline, underlineStyle]} />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword}>
              <Text style={styles.submitText}>Enviar enlace</Text>
            </TouchableOpacity>

            <Text style={styles.signupText}>
              ¿Recordaste tu contraseña?
              <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                {' '}inicia sesión 
              </Text>
            </Text>

          </Animated.View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#181515ff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 10,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#eae0e5ff',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d0cdcdff',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    color: '#b2b0b0ff',
    marginBottom: 20,
    fontSize: 14,
  },
  message: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  errorMessage: {
    color: '#ff5b5b',
  },
  successMessage: {
    color: '#4CAF50',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 15,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 10,
    top: 14,
  },
  input: {
    height: 48,
    borderBottomWidth: 0,
    paddingLeft: 35,
    fontSize: 15,
    color: '#d0cdcdff',
  },
  underline: {
    height: 2,
    width: '100%',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#212121',
    borderRadius: 6,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  signupText: {
    color: '#d0cdcdff',
    marginTop: 15,
  },
  link: {
    color: '#ff5b5b',
    fontWeight: '600',
  },
});
