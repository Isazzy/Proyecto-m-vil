import React, { useState, useEffect } from 'react';
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const { width, height } = Dimensions.get("window");
const backgroundImage = require("../assets/fondo.png");

const allowedDomains = ["gmail.com", "hotmail.com", "yahoo.com"];

const isValidEmailDomain = (email) => {
  if (!email.includes("@")) return false;
  const domain = email.trim().toLowerCase().split("@")[1];
  return allowedDomains.includes(domain);
};

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState(null);

  const firstAnim = useState(new Animated.Value(0))[0];
  const lastAnim = useState(new Animated.Value(0))[0];
  const emailAnim = useState(new Animated.Value(0))[0];
  const passAnim = useState(new Animated.Value(0))[0];
  const confirmAnim = useState(new Animated.Value(0))[0];

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

  const passwordRules = [
    { rule: /.{8,}/, label: "Al menos 8 carácteres" },
    { rule: /[A-Z]/, label: "Una letra mayúscula" },
    { rule: /[a-z]/, label: "Una letra minúscula" },
    { rule: /[0-9]/, label: "Un número" },
  ];

  const passesAllRules = (pw) => passwordRules.every(r => r.rule.test(pw));

  useEffect(() => {
    if (typeMessage === "error" && (email || password || confirmPassword)) {
      setMessage(null);
    }
  }, [email, password, confirmPassword]);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setTypeMessage("error");
      setMessage("Todos los campos son obligatorios.");
      return;
    }

    if (!isValidEmailDomain(email)) {
      setTypeMessage("error");
      setMessage("El dominio del correo no es válido.");
      return;
    }

    if (password !== confirmPassword) {
      setTypeMessage("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!passesAllRules(password)) {
      setTypeMessage("error");
      setMessage("La contraseña debe cumplir con los requisitos.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setTypeMessage("success");
      setMessage("Usuario registrado con éxito.");
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido:\n example@gmail.com";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }

      setTypeMessage("error");
      setMessage(errorMessage);
    }
  };

  const passwordBorderColor =
    password.length === 0 ? '#FF5B5B' :
      passesAllRules(password) ? '#4CAF50' : '#8d0000ff';

  const confirmPasswordBorderColor =
    confirmPassword.length === 0 ? '#FF5B5B' :
      confirmPassword === password ? '#4CAF50' : '#8d0000ff';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ImageBackground
        source={require('../assets/fondo.png')}
        resizeMode="cover"
        style={styles.fondo}
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Regístrate</Text>

          {/* Mensaje */}
          <View style={{ height: height * 0.02, justifyContent: "center", flexDirection: 'row', marginBottom: height * 0.03 }}>
            {message && (
              <Text
                style={[
                  styles.message,
                  typeMessage === "error" && styles.errorMessage,
                  typeMessage === "success" && styles.successMessage
                ]}
              >
                {message}
              </Text>
            )}
          </View>

          <View style={styles.container2}>
            {/* Nombre */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: height * 0.026 }}>
              <View style={[styles.inputContainer, { flex: 1.1, marginRight: 8 }]}>
                <FontAwesome name="user" size={20} color="#fff" style={styles.icon} />
                <Animated.Text style={labelStyle(firstAnim)}>Nombre</Animated.Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onFocus={() => handleFocus(firstAnim)}
                  onBlur={() => handleBlur(firstAnim, firstName)}
                  placeholder=""
                  placeholderTextColor="#f0f0f0ff"
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                    setFirstName(filtered);
                  }}
                />
              </View>

              {/* Apellido */}
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 18 }]}>
                <FontAwesome name="user" size={20} color="#fff" style={styles.icon} />
                <Animated.Text style={labelStyle(lastAnim)}>Apellido</Animated.Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onFocus={() => handleFocus(lastAnim)}
                  onBlur={() => handleBlur(lastAnim, lastName)}
                  placeholder=""
                  placeholderTextColor="#f0f0f0ff"
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                    setLastName(filtered);
                  }}
                />
              </View>
            </View>

            {/* Correo */}
            <View style={[styles, { marginTop: -height * 0.023 }]}>
              <View style={styles.inputContainer}>
                <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
                <Animated.Text style={labelStyle(emailAnim)}>Correo electrónico</Animated.Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => handleFocus(emailAnim)}
                  placeholder=""
                  placeholderTextColor="#f0f0f0ff"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={() => {
                    if (email && !isValidEmailDomain(email)) {
                      setTypeMessage("error");
                      setMessage("El dominio del correo no es válido");
                    }
                    handleBlur(emailAnim, email);
                  }}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={[styles.inputContainer, { borderBottomColor: passwordBorderColor, borderBottomWidth: 2 }]}>
              <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
              <Animated.Text style={labelStyle(passAnim)}>Contraseña</Animated.Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (!passwordTouched) setPasswordTouched(true);
                }}
                onFocus={() => {
                  handleFocus(passAnim);
                  setPasswordFocused(true);
                }}
                onBlur={() => {
                  handleBlur(passAnim, password);
                  setPasswordFocused(false);
                }}
                secureTextEntry={!showPassword}
                placeholder=""
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#e6e9dbff" />
              </TouchableOpacity>
            </View>

            {/* Reglas de contraseña */}
            {passwordTouched && !passesAllRules(password) && passwordFocused && (
              <View style={styles.passwordRulesBox}>
                <Text style={{ fontWeight: 'bold', color: "#f1e6e6ff" }}>
                  La contraseña debe tener:
                </Text>
                {passwordRules.map(({ rule, label }, index) => {
                  const passed = rule.test(password);
                  return (
                    <View key={index} style={styles.ruleItem}>
                      <FontAwesome
                        name={passed ? "check-circle" : "times-circle"}
                        size={14}
                        color={passed ? "#3a803cff" : "#a09898ff"}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          { color: passed ? "#4CAF50" : "#a09898ff" },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Confirmar contraseña */}
            <View style={[styles.inputContainer, { borderBottomColor: confirmPasswordBorderColor, borderBottomWidth: 2 }]}>
              <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
              <Animated.Text style={labelStyle(confirmAnim)}>Confirmar contraseña</Animated.Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => handleFocus(confirmAnim)}
                onBlur={() => handleBlur(confirmAnim, confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                placeholder=""
                placeholderTextColor="#f0f0f0ff"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#e6e9dbff" />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <Text
                style={[
                  styles.passwordMessage,
                  confirmPassword === password ? styles.match : styles.noMatch,
                ]}
              >
                {confirmPassword === password
                  ? "Las contraseñas coinciden"
                  : "Las contraseñas no coinciden"}
              </Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <Text style={styles.logo}>Romina Magallanez</Text>
          <View style={styles.logoText}>
            <View style={styles.line} />
            <View>
              <Text style={styles.TextM}>M I T I E M P O</Text>
            </View>
            <View style={styles.line} />
          </View>

          <View style={styles.LoginContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.LoginText}>
                ¿Ya tenés una cuenta?
                <Text style={{ color: "#ff5b5b" }}> Iniciar sesión </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.01,
  },
  fondo: {
    zIndex: 0,
    width: width,
    height: height,
    position: "absolute",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(32, 23, 23, 0.6)",
    opacity: 1,
  },
  container2: {
    borderRadius: 10,
    padding: width * 0.05,
    width: "100%",
    backgroundColor: "#181515ff",
    paddingVertical: height * 0.03,
  },
  title: {
    color: "#fff",
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: height * 0.02,
    marginBottom: height * 0.026,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: height * 0.026,
    borderBottomWidth: 2,
    borderColor: '#ff5b5b',
    position: 'relative',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: height * 0.05, color: "#fff" },
  button: {
    backgroundColor: '#fa4c4cff',
    paddingVertical: height * 0.010,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: 'bold',
  },
  LoginText: { fontSize: width * 0.04, color: '#fff' },
  logo: {
    color: "#fff",
    fontSize: width * 0.10,
    fontFamily: 'GreatVibes',
    marginTop: height * 0.01,
  },
  logoText: {
    marginBottom: height * 0.02,
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
  TextM: { fontSize: width * 0.03, color: "#b1a8a8ff" },
  passwordRulesBox: {
    width: '70%',
    marginTop: -13,
    marginBottom: height * 0.02,
  },
  ruleItem: { flexDirection: 'row', alignItems: 'center' },
  ruleText: { fontSize: 10 },
  passwordMessage: {
    fontSize: 13,
    textAlign: "left",
    marginTop: -13,
    fontWeight: "bold",
  },
  match: { color: "#3a803cff" },
  noMatch: { color: "#ac0202ff" },
  message: {
    fontSize: width * 0.04,
    textAlign: "center",
    marginBottom: height * 0.1,
    position: "absolute",
  },
  errorMessage: { color: "#ff5b5b", marginBottom: height * 0.1 },
  successMessage: { color: "#4CAF50", marginBottom: height * 0.1 },
  LoginContainer: { marginTop: height * 0.02, alignItems: 'center' },
});
