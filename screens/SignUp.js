import React, { useState, useEffect, useMemo } from 'react';
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

// --- PALETA "NEÓN OSCURO" ---
const COLORES = {
  fondo: '#000000',
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#6ba1c1ff',
  acentoVerde: '#5BFB5B',
};

const allowedDomains = ["gmail.com", "hotmail.com", "yahoo.com"];

const isValidEmailDomain = (email) => {
  if (!email.includes("@")) return false;
  const domain = email.trim().toLowerCase().split("@")[1];
  return allowedDomains.includes(domain);
};

export default function SignUp({ navigation }) {
  // (Tu lógica de 'useState' se mantiene intacta)
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
  const [isPasswordBlurred, setIsPasswordBlurred] = useState(false)

  // (Tu lógica de Animación se mantiene intacta)
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

  // --- CAMBIO: Solo colores ---
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
      outputRange: [COLORES.textoSecundario, COLORES.acentoPrincipal], // <-- Colores
    }),
  });

  const passwordRules = [
    { rule: /.{8,}/, label: "Al menos 8 carácteres" },
    { rule: /[A-Z]/, label: "Una letra mayúscula." },
    { rule: /[a-z]/, label: "Una letra minúscula." },
    { rule: /[0-9]/, label: "Un número." },
  ];

  const isPasswordValid = useMemo (() =>{
    return passwordRules.every(({rule}) => rule.test(password));
  },[password]);

  // (Tu 'useEffect' se mantiene intacto)
  useEffect(() => {
    if (typeMessage === "error" && (email || password || confirmPassword)) {
      setMessage(null);
    }
  }, [email, password, confirmPassword]);

  // (Tu 'handleSignUp' se mantiene intacto)
  const handleSignUp = async () => {
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setTypeMessage("error");
      setMessage("Todos los campos son obligatorios.");
      return;
    }
    if (firstName.length < 2){
      setTypeMessage("error");
      setMessage("El nombre debe tener al menos 2 carácteres")
      return;
    }
    if (lastName.length < 2){
      setTypeMessage("error");
      setMessage("El Apellido debe tener al menos 2 carácteres")
      return;
    }

    if (!isValidEmailDomain(email)) {
      setTypeMessage("error");
      setMessage("Formato de correo inválido.");
      return;
    }

    if (password !== confirmPassword) {
      setTypeMessage("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    if (!isPasswordValid) {
      setTypeMessage("error");
      setMessage("La contraseña debe cumplir con los requisitos.")
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setTypeMessage("success");
      setMessage("Usuario registrado con éxito.");
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] }); // <-- Navega a Auth (Login)
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido:\n example@gmail.com";
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
    password.length === 0 ? COLORES.acentoPrincipal :
      isPasswordValid ? COLORES.acentoVerde : COLORES.acentoPrincipal;

  const confirmPasswordBorderColor =
    password.length === 0 ? COLORES.acentoPrincipal :
      (password.length > 0 && password === confirmPassword) ? COLORES.acentoVerde : COLORES.acentoPrincipal;


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
          <Text style={styles.title}>Crear Cuenta</Text>

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
              <View style={[styles.inputContainer, { flex: 1.1, marginRight: 8, borderColor: COLORES.acentoPrincipal }]}>
                <FontAwesome name="user" size={20} color={COLORES.textoPrincipal} style={styles.icon} />
                <Animated.Text style={labelStyle(firstAnim)}>Nombre</Animated.Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  maxLength={25}
                  onFocus={() => handleFocus(firstAnim)}
                  onBlur={() => handleBlur(firstAnim, firstName)}
                  placeholder=""
                  placeholderTextColor={COLORES.textoSecundario}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                    setFirstName(filtered);
                  }}
                />
              </View>

              {/* Apellido */}
              <View style={[styles.inputContainer, { flex: 1, marginLeft: 18, borderColor: COLORES.acentoPrincipal }]}>
                <FontAwesome name="user" size={20} color={COLORES.textoPrincipal} style={styles.icon} />
                <Animated.Text style={labelStyle(lastAnim)}>Apellido</Animated.Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  maxLength={25}
                  onFocus={() => handleFocus(lastAnim)}
                  onBlur={() => handleBlur(lastAnim, lastName)}
                  placeholder=""
                  placeholderTextColor={COLORES.textoSecundario}
                  onChangeText={(text) => {
                    const filtered = text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                    setLastName(filtered);
                  }}
                />
              </View>
            </View>

            {/* Correo */}
            <View style={[styles, { marginTop: -height * 0.023 }]}>
              <View style={[styles.inputContainer, { borderColor: COLORES.acentoPrincipal }]}>
                <FontAwesome name="envelope" size={20} color={COLORES.textoPrincipal} style={styles.icon} />
                <Animated.Text style={labelStyle(emailAnim)}>Correo electrónico</Animated.Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => handleFocus(emailAnim)}
                  placeholder=""
                  placeholderTextColor={COLORES.textoSecundario}
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
              <FontAwesome name="lock" size={20} color={COLORES.textoPrincipal} style={styles.icon} />
              <Animated.Text style={labelStyle(passAnim)}>Contraseña</Animated.Text>
              <TextInput
                style={styles.input}
                value={password}
                maxLength={25}
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
                  setIsPasswordBlurred(true);
                }}
                secureTextEntry={!showPassword}
                placeholder=""
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={COLORES.textoPrincipal} />
              </TouchableOpacity>
            </View>

            {/* Reglas de contraseña */}
            {passwordTouched && !isPasswordValid && passwordFocused && (
              <View style={styles.passwordRulesBox}>
                <Text style={styles.rulesTitle}>
                  Requisitos:
                </Text>
                {passwordRules.map(({ rule, label }, index) => {
                  const passed = rule.test(password);
                  return (
                    <View key={index} style={styles.ruleItem}>
                      <FontAwesome
                        name={passed ? "check-circle" : "times-circle"}
                        size={12}
                        color={passed ? COLORES.acentoVerde : COLORES.textoSecundario}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.ruleText,
                          { color: passed ? COLORES.acentoVerde : COLORES.textoSecundario },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
            {isPasswordBlurred && !isPasswordValid && (
              <Text style={styles.passwordErrorText}>
                La contraseña no cumple con los requisitos
              </Text>
            )}

            {/* Confirmar contraseña */}
            <View style={[styles.inputContainer, { borderBottomColor: confirmPasswordBorderColor, borderBottomWidth: 2 }]}>
              <FontAwesome name="lock" size={20} color={COLORES.textoPrincipal} style={styles.icon} />
              <Animated.Text style={labelStyle(confirmAnim)}>Confirmar contraseña</Animated.Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                maxLength={25}
                onChangeText={setConfirmPassword}
                onFocus={() => handleFocus(confirmAnim)}
                onBlur={() => handleBlur(confirmAnim, confirmPassword)}
                secureTextEntry={!showConfirmPassword}
                placeholder=""
                placeholderTextColor={COLORES.textoSecundario}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color={COLORES.textoPrincipal} />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && password.length > 0 && (
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
            <Text style={styles.TextM}>M I T I E M P O</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.LoginContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.LoginText}>
                ¿Ya tenés una cuenta?
                <Text style={{ color: COLORES.acentoPrincipal }}> Iniciar sesión </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- ESTILOS "NEÓN OSCURO" (Solo colores) ---
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
    backgroundColor: "rgba(0, 0, 0, 0.85)", // <-- CAMBIO: Fondo más oscuro
  },
  container2: {
    borderRadius: 16, // <-- CAMBIO: Más redondeado
    padding: width * 0.05,
    width: "100%",
    backgroundColor: COLORES.superficie, // <-- CAMBIO: Color de superficie
    paddingVertical: height * 0.03,
  },
  title: {
    color: COLORES.textoPrincipal, // <-- CAMBIO
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: height * 0.02,
    marginBottom: 5,
  },
  messageContainer: { 
    height: height * 0.04,
    justifyContent: "center",
    flexDirection: 'row',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: height * 0.026,
    borderBottomWidth: 2,
    borderColor: COLORES.acentoPrincipal, 
    position: 'relative',
  },
  icon: { 
    marginRight: 10,
    color: COLORES.textoPrincipal, 
  },
  input: { 
    flex: 1, 
    height: height * 0.05, 
    color: COLORES.textoPrincipal // <-- CAMBIO
  },
  button: {
    backgroundColor: COLORES.acentoAzul, // <-- CAMBIO
    paddingVertical: 14, // <-- CAMBIO
    borderRadius: 16, // <-- CAMBIO
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  buttonText: {
    color: COLORES.textoPrincipal, // <-- CAMBIO
    fontSize: 16, // <-- CAMBIO
    fontWeight: 'bold',
  },
  LoginText: { 
    fontSize: width * 0.04, 
    color: COLORES.textoPrincipal // <-- CAMBIO
  },
  logo: {
    color: COLORES.textoPrincipal, // <-- CAMBIO
    fontSize: width * 0.10,
    fontFamily: 'GreatVibes',
    marginTop: height * 0.01,
  },
  logoText: {
    marginBottom: height * 0.02,
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center', // <-- CAMBIO
  },
  line: {
    width: "35%",
    backgroundColor: COLORES.textoSecundario, // <-- CAMBIO
    height: 1,
  },
  TextM: { 
    fontSize: width * 0.03, 
    color: COLORES.textoSecundario, // <-- CAMBIO
    marginHorizontal: 8, // <-- CAMBIO
  },
  passwordRulesBox: {
    width: '100%', // <-- CAMBIO
    marginTop: -15, // <-- CAMBIO
    marginBottom: height * 0.02,
    paddingLeft: 10, // <-- CAMBIO
  },
  rulesTitle: { // <-- NUEVO
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORES.textoPrincipal,
    marginBottom: 4,
  },
  ruleItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 2, // <-- CAMBIO
  },
  ruleText: { 
    fontSize: 12, // <-- CAMBIO
  },
  passwordMessage: {
    fontSize: 13,
    textAlign: "left",
    marginTop: -15, // <-- CAMBIO
    marginBottom: 10, // <-- CAMBIO
    fontWeight: "bold",
  },
  match: { 
    color: COLORES.acentoVerde // <-- CAMBIO
  },
  noMatch: { 
    color: COLORES.acentoPrincipal // <-- CAMBIO
  },
  passwordErrorText: { // <-- NUEVO
    color: COLORES.acentoPrincipal,
    marginTop: -20,
    marginBottom: 20,
    fontSize: 11,
  },
  message: {
    fontSize: width * 0.04,
    textAlign: "center",
  },
  errorMessage: { 
    color: COLORES.acentoPrincipal, // <-- CAMBIO
  },
  successMessage: { 
    color: COLORES.acentoVerde, // <-- CAMBIO
  },
  LoginContainer: { 
    marginTop: height * 0.02, 
    alignItems: 'center' 
  },
});