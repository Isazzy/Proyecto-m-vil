import React, { useState, useEffect } from 'react';
import {
  View,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,    
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get("window");
const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#5B5BFB',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState(null);

  const emailAnim = useSharedValue(0);
  const emailLabelStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 45, 
    top: withTiming(emailAnim.value ? -10 : 15, { duration: 200 }),
    fontSize: withTiming(emailAnim.value ? 13 : 16, { duration: 200 }),
    color: emailAnim.value ? COLORES.acentoPrincipal : COLORES.textoSecundario,
    backgroundColor: COLORES.superficie, // Para tapar el borde
    paddingHorizontal: 4,
    zIndex: 1, 
  }));

  useEffect(() => {
    if ((typeMessage === "error" || typeMessage === "success") && email) {
      setMessage(null);
      setTypeMessage(null);
    }
  }, [email]);

  // (handleResetPassword se mantiene 100% igual)
  const handleResetPassword = () => {
    if (!email) {
      setTypeMessage("error");
      setMessage("Ingresa tu correo electrónico");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setTypeMessage("success");
        setMessage("Si el correo está registrado, te enviaremos un enlace para restablecer la contraseña.\nRevise su bandeja de entrada y Spam.");
      })
      .catch((error) => {
        setTypeMessage("error");
        setMessage("Ha ocurrido un error. Intenta nuevamente más tarde.");
        console.log("Firebase error:", error.code);
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* --- CAMBIO: Sin ImageBackground --- */}
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.titulo}>Recuperar contraseña</Text>

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
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color={COLORES.textoSecundario} style={styles.icon} />
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
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleResetPassword}>
            <Text style={styles.submitText}>Enviar enlace</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            ¿Recordaste tu contraseña?
            <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
              {' '}Inicia sesión 
            </Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- ESTILOS "NEÓN OSCURO" ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // (formContainer eliminado, se integra al scroll)
  titulo: { // (Antes 'logoText')
    fontSize: 22, // Título consistente
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    color: COLORES.textoSecundario,
    marginBottom: 20,
    fontSize: 14,
    paddingHorizontal: 20, // Para que no sea tan ancho
  },
  message: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 10,
  },
  errorMessage: {
    color: COLORES.acentoPrincipal,
  },
  successMessage: {
    color: COLORES.acentoVerde, // Verde
  },
  // --- CAMBIO: Estilo de Input (consistente con Login) ---
  inputContainer: {
    backgroundColor: COLORES.superficie,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORES.superficie,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    height: 55,
    paddingHorizontal: 10,
    width: '100%',
  },
  icon: {
    marginRight: 10,
    marginLeft: 5,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORES.textoPrincipal,
    fontSize: 16,
  },
  // (underline eliminado)
  submitBtn: {
    backgroundColor: COLORES.acentoAzul, // Color de acción
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: COLORES.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    color: COLORES.textoPrincipal, // <-- CAMBIO
    marginTop: 20, // Más espacio
  },
  link: {
    color: COLORES.acentoPrincipal, // Tu color
    fontWeight: '600',
  },
});