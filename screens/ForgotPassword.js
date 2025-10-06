import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get("window");

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [typeMessage, setTypeMessage] = useState(null);

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
        setMessage("Si el correo está registrado, recibirás un enlace para restablecer la contraseña.");
      })
      .catch((error) => {
        setTypeMessage("error");
        setMessage("Ha ocurrido un error. Intenta nuevamente más tarde.");
        console.log("Firebase error:", error.code);
      });
  };

  return (
    <View style={styles.container}>
      <Animated.Text entering={FadeInDown.duration(800)} style={styles.title}>
        Recuperar contraseña
      </Animated.Text>

      {message && (
        <Animated.Text 
          entering={FadeInDown.duration(1000)}
          style={[styles.message, typeMessage === "error" ? styles.errorMessage : styles.successMessage]}>
          {message}
        </Animated.Text>
      )}

      <Animated.View entering={FadeInUp.duration(900)} style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(1000)}>
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center', 
    padding:20,
    backgroundColor: '#f5f5f5',
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333',
  },
  message: { 
    marginBottom: 15, 
    textAlign: 'center',
    fontSize: 14,
  },
  errorMessage: { color: '#ff5b5b' },
  successMessage: { color: '#4CAF50' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: 45, fontSize: 16, color: '#333' },
  button: { 
    backgroundColor: '#fa4c4c', 
    padding: 15, 
    borderRadius: 8,
    width: width * 0.8,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    textAlign: 'center',
    fontSize: 16,
  },
});
