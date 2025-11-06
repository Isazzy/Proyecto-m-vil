import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInLeft, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get("window");

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
    left: 35,
    top: withTiming(emailAnim.value ? -10 : 12, { duration: 200 }),
    fontSize: withTiming(emailAnim.value ? 13 : 16, { duration: 200 }),
    color: emailAnim.value ? '#ff5b5b' : '#aaa',
  }));

  const passLabelStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 35,
    top: withTiming(passAnim.value ? -10 : 12, { duration: 200 }),
    fontSize: withTiming(passAnim.value ? 13 : 16, { duration: 200 }),
    color: passAnim.value ? '#ff5b5b' : '#aaa',
  }));

  // ✅ Validar formato del correo
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

  // Cargar credenciales guardadas
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

  // ✅ Manejar login
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
      const user = userCredential.user;

      if (remember) {
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("password", password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }

      setMessage("Has iniciado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Animated.Image
            entering={FadeInLeft.duration(1600)}
            source={require('../assets/fondo.png')}
            style={styles.fondo}
          />
        </View>

        <Animated.Text entering={FadeInDown.duration(1600)} style={styles.title}>
          ¡Bienvenido de nuevo!
        </Animated.Text>

        {/* 🔴 Mensajes globales de error o éxito */}
        <View style={{ height: height * 0.03, justifyContent: "center", textAlign: "center", flexDirection: 'row' }}>
          {message && <Text style={[styles.message, typeMessage === "error" && styles.errorMessage]}>{message}</Text>}
        </View>

        <View style={styles.formBox}>
          {/* Correo */}
          <View style={[styles.inputContainer, emailError && { borderColor: '#ff5b5b' }]}>
            <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
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
              placeholderTextColor="#f0f0f0ff"
              onFocus={() => emailAnim.value = 1}
              onBlur={() => {
                emailAnim.value = email ? 1 : 0;
                if (email) validateEmailFormat(email);
              }}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
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
              <FontAwesome name={showPassword ? "eye-slash" : "eye"} marginRight={10} size={18} color="#e6e9dbff" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.remember} 
              onPress={async () => {
                setRemember(!remember);
                if (remember) {
                  setEmail('');
                  setPassword('');
                  emailAnim.value = 0;
                  passAnim.value = 0;
                  await AsyncStorage.removeItem("email");
                  await AsyncStorage.removeItem("password");
                }
              }}
            >
              <FontAwesome name={remember ? "check-square" : "square-o"} size={18} color="#fff" />
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
          <View>
            <Text style={styles.TextM}> M  I    T  I  E  M  P  O </Text>
          </View>
          <View style={styles.line} />
        </View>

        <View style={styles.signUpContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>¿No tenés cuenta aún?
              <Text style={{ color: "#ff5b5b" }}>  Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: '#181515ff',
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    borderBottomRightRadius: 100,
    overflow: "hidden",
    opacity: 0.4,
  },
  fondo: {
    width: width * 1.1,
    height: height * 0.3,
  },
  title: {
    fontFamily: 'GreatVibes',
    color: "#fff",
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: height * 0.06,
    marginBottom: height * 0.02,
  },
  formBox: {
    borderRadius: 20,
    padding: width * 0.05,
    width: "100%",
    marginTop: height * 0.05,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ff5b5b',
    marginBottom: height * 0.04,
  },
  icon: {
    marginRight: 5,
    marginTop: height * -0.006,
  },
  input: {
    flex: 1,
    height: height * 0.05,
    color: "#fff",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginVertical: height * 0.015,
    marginTop: height * -0.009,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: "#fdfdfdff",
    marginLeft: 5,
    fontSize: width * 0.032,
  },
  forgot: {
    color: '#c7d9e4ff',
    fontSize: width * 0.030,
  },
  button: {
    backgroundColor: '#fa4c4cff',
    paddingVertical: height * 0.007,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.06,
  },
  logo: {
    color: "#fff",
    fontSize: width * 0.10,
    fontFamily: 'GreatVibes',
    marginTop: height * 0.03,
  },
  logoText: {
    marginBottom: height * 0.04,
    flexDirection: 'row',
    justifyContent: "space-between",
  },
  line: {
    width: "35%",
    backgroundColor: "#a5a3a3ff",
    marginHorizontal: 8,
    height: 1,
    marginTop: height * 0.010,
  },
  TextM: {
    fontSize: width * 0.03,
    color: "#b1a8a8ff"
  },
  signUpContainer: {
    marginBottom: height * 0.04,
  },
  signUpText: {
    fontSize: width * 0.04,
    color: '#ffffffff',
  },
  message: {
    marginTop: height * 0.01,
    fontSize: width * 0.04,
    textAlign: "center",
  },
  errorMessage: {
    color: "#ff5b5b",
  },
});
