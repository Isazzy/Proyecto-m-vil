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
          errorMessage = "El formato del correo electrónico no es válido.";
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

  // Colores dinámicos para los inputs
  const passwordBorderColor = password.length === 0
    ? '#FF5B5B'
    : passesAllRules(password)
      ? '#4CAF50'
      : '#817b7bff';

  const confirmPasswordBorderColor = confirmPassword.length === 0
    ? '#FF5B5B'
    : confirmPassword === password
      ? '#4CAF50'
      : '#817b7bff';

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

          {/* Mensaje de error o éxito */}
          <View style={{ height: height * 0.02, justifyContent: "center", flexDirection: 'row', marginBottom: height * 0.02 }}>
            {message && (
              <Text style={[
                styles.message,
                typeMessage === "error" && styles.errorMessage,
                typeMessage === "success" && styles.successMessage
              ]}>
                {message}
              </Text>
            )}
          </View>

        <View style={styles.container2}>
            {/* Nombre */}
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese su nombre"
                placeholderTextColor="#f0f0f0ff"
                value={firstName}
                onChangeText={(text) => {
                  // Solo letras (mayúsculas, minúsculas, acentos, ñ) y espacios
                  const filtered = text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                  setFirstName(filtered);
                }}
              />
            </View>

            {/* Apellido */}
            <View style={styles.inputContainer}>
              <FontAwesome name="user" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese su apellido"
                placeholderTextColor="#f0f0f0ff"
                value={lastName}
                onChangeText={(text) => {
                  const filtered = text.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                  setLastName(filtered);
                }}
              />
            </View>


            {/* Correo  */}
            <View style={styles.inputContainer} >
              <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese su correo"
                placeholderTextColor="#f0f0f0ff"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={() => {
                  if (email && ! isValidEmailDomain(email)){
                    setTypeMessage("error");
                    setMessage("El dominio del correo no es válido")
                  }
                }}
              />
            </View>
           

            {/* Contraseña */}
            <View style={[styles.inputContainer, { borderBottomColor: passwordBorderColor, borderBottomWidth: 2 }]}>
              <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Ingrese su contraseña"
                placeholderTextColor="#f0f0f0ff"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (!passwordTouched) setPasswordTouched(true);
                }}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <FontAwesome
                  name={showPassword ? "eye-slash" : "eye"}
                  size={20}
                  color="#e6e9dbff"
                />
              </TouchableOpacity>
            </View>

            {/* Reglas de contraseña */}
            {passwordTouched && !passesAllRules(password) && passwordFocused && (
                <View style={styles.passwordRulesBox}>
                <Text style={{ fontWeight: 'bold', color:"#f1e6e6ff",fontSize: 11, }}>
                    La contraseña debe contener:
                </Text>
                {passwordRules.map(({ rule, label }, index) => {
                    const passed = rule.test(password);
                    return (
                    <View key={index} style={styles.ruleItem}>
                        <FontAwesome
                        name={passed ? "check-circle" : "times-circle"}
                        size={16}
                        color={passed ? "#4CAF50" : "#d61717ff"}
                        style={{ marginRight: 8 }}
                        />
                        <Text
                        style={[
                            styles.ruleText,
                            { color: passed ? "#4CAF50" : "#d61717ff" },
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
              <TextInput
                style={styles.input}
                placeholder="Confirme su contraseña"
                placeholderTextColor="#f0f0f0ff"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <FontAwesome
                  name={showConfirmPassword ? "eye-slash" : "eye"}
                  size={20}
                  color="#e6e9dbff"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <Text style={styles.logo}>Romina Magallanez</Text>
          <View style={styles.logoText}>
            <View style={styles.line} />
            <View>
              <Text style={styles.TextM}> M  I    T  I  E  M  P  O </Text>
            </View>
            <View style={styles.line} />
          </View>

          <View style={styles.LoginContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.LoginText}>¿Ya tenés una cuenta?
                <Text style={{ color: "#ff5b5b" }}>  Iniciar sesión </Text>
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
    justifyContent:"center",
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
    marginBottom: height * 0.00,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: height * 0.026,
    borderBottomWidth: 2,
    borderColor: '#ff5b5b',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: height * 0.05,
    color: "#fff",
  },
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
  LoginText: {
    fontSize: width * 0.04,
    color: '#fff',
  },
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
  TextM: {
    fontSize: width * 0.03,
    color: "#b1a8a8ff"
  },
  passwordRulesBox: {
    width: '70%',
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleText: {
    fontSize: 10,
  },
  message: {
    fontSize: width * 0.04,
    textAlign: "center",
    position: "absolute",
  },
  errorMessage: {
    color: "#ff5b5b",
  },
  successMessage: {
    color: "#4CAF50",
  },
});
