import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function ForgotPassword({ navigation }) {
  // Estados principales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState(null);

  // Animaciones de labels
  const emailAnim = useState(new Animated.Value(0))[0];
  const passAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('email');
        const savedPassword = await AsyncStorage.getItem('password');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRemember(true);
          Animated.timing(emailAnim, { toValue: 1, duration: 0, useNativeDriver: false }).start();
          Animated.timing(passAnim, { toValue: 1, duration: 0, useNativeDriver: false }).start();
        }
      } catch (error) {
        setTypeMessage('error');
        setMessage('Error al cargar credenciales');
      }
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    if (typeMessage === 'error' && email && password) {
      setMessage(null);
    }
  }, [email, password]);

  const handleFocus = (anim) => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (anim, value) => {
    if (!value) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setTypeMessage('error');
      setMessage('Por favor complete ambos campos.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario logueado:', user);
      if (remember) {
        await AsyncStorage.setItem('email', email);
        await AsyncStorage.setItem('password', password);
      } else {
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('password');
      }
      setMessage('Has iniciado sesión correctamente.');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      let errorMessage = 'Correo y/o contraseña incorrectas.';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'La contraseña es incorrecta.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No se encontró un usuario con este correo.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión, por favor intenta más tarde.';
          break;
      }
      setMessage(errorMessage);
      setTypeMessage('error');
    }
  };

  const labelStyle = (anim) => ({
    position: 'absolute',
    left: 35,
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, -10],
    }),
    fontSize: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 13],
    }),
    color: anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['#aaa', '#ff5b5b'],
    }),
  });

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageBackground source={require('../assets/fondo.png')} style={styles.fondo} />
        </View>

        <Text style={styles.title}>¡Bienvenido de nuevo!</Text>

        <View style={{ height: height * 0.01, justifyContent: 'center', textAlign: 'center', flexDirection: 'row' }}>
          {message && <Text style={[styles.message, styles.errorMessage]}>{message}</Text>}
        </View>

        <View style={styles.formBox}>
          {/* --- Input animado Email --- */}
          <View style={styles.inputContainer}>
            <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
            <Animated.Text style={labelStyle(emailAnim)}>Correo electrónico</Animated.Text>
            <TextInput
              style={styles.input}
              value={email}
              onFocus={() => handleFocus(emailAnim)}
              onBlur={() => handleBlur(emailAnim, email)}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder=""
              placeholderTextColor="#999"
            />
          </View>

          {/* --- Input animado Password --- */}
          <View style={styles.inputContainer}>
            <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
            <Animated.Text style={labelStyle(passAnim)}>Contraseña</Animated.Text>
            <TextInput
              style={styles.input}
              value={password}
              onFocus={() => handleFocus(passAnim)}
              onBlur={() => handleBlur(passAnim, password)}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder=""
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={18} color="#e6e9dbff" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity style={styles.remember} onPress={() => setRemember(!remember)}>
              <FontAwesome name={remember ? 'check-square' : 'square-o'} size={18} color="#fff" />
              <Text style={styles.rememberText}>Recordar</Text>
            </TouchableOpacity>
            <TouchableOpacity >
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
          <Text style={styles.TextM}> M I T I E M P O </Text>
          <View style={styles.line} />
        </View>

        <View style={styles.signUpContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>
              ¿No tenés cuenta aún? <Text style={{ color: '#ff5b5b' }}> Regístrate</Text>
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
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: '#181515',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    borderBottomRightRadius: 100,
    overflow: 'hidden',
    opacity: 0.4,
  },
  fondo: {
    width: width * 1.1,
    height: height * 0.3,
  },
  title: {
    fontFamily: 'GreatVibes',
    color: '#fff',
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: height * 0.06,
    marginBottom: height * 0.02,
  },
  formBox: {
    borderRadius: 20,
    padding: width * 0.05,
    width: '100%',
    marginTop: height * 0.05,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ff5b5b',
    marginBottom: height * 0.05,
    position: 'relative',
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: height * 0.05,
    color: '#fff',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: height * 0.015,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#fdfdfd',
    marginLeft: 5,
    fontSize: width * 0.032,
  },
  forgot: {
    color: '#c7d9e4',
    fontSize: width * 0.03,
  },
  button: {
    backgroundColor: '#fa4c4c',
    paddingVertical: height * 0.01,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.06,
  },
  logo: {
    color: '#fff',
    fontSize: width * 0.1,
    fontFamily: 'GreatVibes',
    marginTop: height * 0.03,
  },
  logoText: {
    marginBottom: height * 0.04,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  line: {
    width: '35%',
    backgroundColor: '#a5a3a3',
    marginHorizontal: 8,
    height: 1,
    marginTop: height * 0.01,
  },
  TextM: {
    fontSize: width * 0.03,
    color: '#b1a8a8',
  },
  signUpContainer: {
    marginBottom: height * 0.04,
  },
  signUpText: {
    fontSize: width * 0.04,
    color: '#fff',
  },
  message: {
    marginTop: height * 0.01,
    fontSize: width * 0.04,
    textAlign: 'center',
    position: 'absolute',
  },
  errorMessage: {
    color: '#ff5b5b',
  },
});
