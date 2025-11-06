//screens/Login.js

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  StatusBar,   
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get("window");
const COLORES = {
  fondo: '#000000',
  superficie: '#190101', //190101
  textoPrincipal: '#FEE6E6', 
  textoSecundario: '#A0A0A0', 
  acentoPrincipal: '#FB5B5B', //FB5B5B
  acentoAzul: '#6ba1c1ff',     //6ba1c1ff
};

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState(null);
  const [emailError, setEmailError] = useState(null);

  // Animaciones de labels
  const emailAnim = useSharedValue(0);
  const passAnim = useSharedValue(0);

  const emailLabelStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 45, 
    top: withTiming(emailAnim.value ? -10 : 15, { duration: 200 }),
    fontSize: withTiming(emailAnim.value ? 13 : 16, { duration: 200 }),
    color: emailAnim.value ? COLORES.acentoPrincipal : COLORES.textoSecundario, 
    paddingHorizontal: 4,
  }));

  const passLabelStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 45, 
    top: withTiming(passAnim.value ? -10 : 15, { duration: 200 }),
    fontSize: withTiming(passAnim.value ? 13 : 16, { duration: 200 }),
    color: passAnim.value ? COLORES.acentoPrincipal : COLORES.textoSecundario, 
    paddingHorizontal: 4,
  }));

  const validateEmailFormat = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Formato de correo electrónico inválido");
      setTypeMessage("error");
      setMessage("Formato de correo electrónico inválido");
    } else {
      setEmailError(null);
      setMessage(null);
    }
  };

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("email");
        const savedPassword = await AsyncStorage.getItem("password");
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRemember(true);
          emailAnim.value = 1;
          passAnim.value = 1;
        }
      } catch (error) {
        setTypeMessage("error");
        setMessage("Error al cargar credenciales");
      }
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    if (typeMessage === "error" && email && password) setMessage(null);
  }, [email, password]);

  
  const handleLogin = async () => {
    if (!email || !password) {
      setTypeMessage("error");
      setMessage("Por favor complete ambos campos.");
      return;
    }

    if (emailError) {
      setTypeMessage("error");
      setMessage(emailError);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // const user = userCredential.user;

      if (remember) {
        await AsyncStorage.setItem('email', email);
      } else {
        await AsyncStorage.removeItem('email');
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
    } catch (error) {
      let errorMessage = "Correo y/o contraseña incorrectas.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      setMessage(errorMessage);
      setTypeMessage("error");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        
        <Animated.Text entering={FadeInDown.duration(1600)} style={styles.title}>
          ¡Bienvenido de nuevo!
        </Animated.Text>
        
        <View style={styles.messageContainer}>
          {message && <Text style={[styles.message, typeMessage === "error" && styles.errorMessage]}>{message}</Text>}
        </View>

        <View style={styles.formBox}>
          {/* Email */}
          <View style={[styles.inputContainer, emailError && { borderColor: COLORES.acentoAzul }]}>
            <FontAwesome name="envelope" size={20} color={COLORES.textoSecundario} style={styles.icon} />
            <Animated.Text style={emailLabelStyle}>Correo electrónico</Animated.Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) {
                  setEmailError(null);
                  setMessage(null);
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORES.textoSecundario}
              onFocus={() => emailAnim.value = 1}
              onBlur={() => {
                emailAnim.value = email ? 1 : 0;
                if (email) validateEmailFormat(email);
              }}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputContainer,{  borderBottomWidth: 2 }]}>
            <FontAwesome name="lock" size={20} color={COLORES.textoSecundario} style={styles.icon} />
            <Animated.Text style={passLabelStyle}>Contraseña</Animated.Text>
            <TextInput
              style={styles.input}
              placeholder=""
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => passAnim.value = 1}
              onBlur={() => passAnim.value = password ? 1 : 0}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} marginRight={10} size={18} color={COLORES.textoSecundario} />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.remember} 
              onPress={async () => {
                setRemember(!remember);
                if (remember) {
                }
              }}
            >
              <FontAwesome name={remember ? "check-square" : "square-o"} size={18} color={COLORES.textoPrincipal} />
              <Text style={styles.rememberText}>Recordar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.logo}>Romina Magallanez</Text>
        <View style={styles.logoText}>
          <View style={styles.line} />
          <Text style={styles.TextM}> M  I    T  I  E  M  P  O </Text>
          <View style={styles.line} />
        </View>

        <View style={styles.signUpContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>¿No tenés cuenta aún?
              <Text style={{ color: COLORES.acentoPrincipal }}>  Regístrate</Text>
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
    backgroundColor: COLORES.fondo,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
  },
 
  title: {
    fontFamily: 'GreatVibes', 
    color: COLORES.textoPrincipal,
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: height * 0.06,
    marginBottom: height * 0.02,
  },
  messageContainer: {
    height: height * 0.03, 
    justifyContent: "center", 
    alignItems: 'center',
  },
  formBox: {
    width: "100%",
    marginTop: height * 0.05,
  },
  //  Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORES.acentoPrincipal, // Tu color original
    marginBottom: height * 0.04,
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginVertical: height * 0.015,
    marginTop: -10, // Sube las opciones
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: COLORES.textoPrincipal,
    marginLeft: 5,
    fontSize: width * 0.032,
  },
  forgot: {
    color: COLORES.acentoPrincipal,
    fontSize: width * 0.030,
  },
  // --- CAMBIO: Estilo de Botón ---
  button: {
    backgroundColor: COLORES.superficie, // Azul para acción principal
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  buttonText: {
    color: COLORES.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    color: COLORES.textoPrincipal,
    fontSize: width * 0.10,
    fontFamily: 'GreatVibes',
    marginTop: height * 0.03,
  },
  logoText: {
    marginBottom: height * 0.04,
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
  },
  line: {
    width: "35%",
    backgroundColor: COLORES.textoSecundario,
    height: 1,
  },
  TextM: {
    fontSize: width * 0.03,
    color: COLORES.textoSecundario,
    marginHorizontal: 8,
  },
  signUpContainer: {
    marginBottom: height * 0.04,
  },
  signUpText: {
    fontSize: width * 0.04,
    color: COLORES.textoPrincipal,
  },
  message: {
    fontSize: width * 0.04,
    textAlign: "center",
  },
  errorMessage: {
    color: COLORES.acentoPrincipal,
  },
});