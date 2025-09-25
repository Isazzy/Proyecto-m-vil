import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { ImageBackground } from 'react-native'
export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const handleLogin = async () => {
    if (!email || !password)//Si los campos están vacíos muestra un error// 
    {
      Alert.alert("Error", "Por favor ingrese ambos campos.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login exitoso", "Has iniciado sesión correctamente.");
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      let errorMessage = "Hubo un problema al iniciar sesión.";
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
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    
    <View style={styles.container}>
      <ImageBackground source={require('../assets/fondo.png')} style={styles.fondo} />
     
      
      <Text style={styles.title}>Iniciar sesión</Text>

      <View style={styles.formBox}>
      <Text style={styles.label}>Correo</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.remember} onPress={() => setRemember(!remember)}>
          <FontAwesome name={remember ? "check-square" : "square-o"} size={18} color="#fff" />
          <Text style = {styles.rememberText}>Recordar Usuario</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
      </View>
      {/* logo*/}
      <Text style={styles.logo}>Romina Magallanez</Text>
      <View style={styles.logoText}>
        <View style={styles.line} > ――― </View>
        <View style={styles.TextM}>MI TIEMPO</View>
        <View style={styles.line}> ――― </View> 
      </View>
      
      <View style={styles.signUpContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>¿No tienes cuenta aún?  
            <Text style={{color: "#ff5b5b"}}> Regístrarse</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 55,
    backgroundColor: '#1f1f1f',
  },
 
 
  fondo: {
    width: 411,
    height: 258,
    position: 'absolute',
    top: 0,
    borderightRadius:30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    padding: 50,
    flex: 11,
    position:'absolute',
    marginBottom: 510,
  },

  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formBox:{
    position:'absolute',
    flex: 2,
    backgroundColor: '#928e8eff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderRadius: 30,
    padding:5,
    width: 365,
    height: 350,
    marginBottom: -110,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ff5b5b',
    marginBottom: 20,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
  },
  optionsRow:{
    flexDirection:"row",
    justifyContent:'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  remember:{
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rememberText:{
    color: "#fdfdfdff",
    marginLeft: 5,
    fontSize: 12,
  },
  forgot:{
    color: '#142129ff',
    textDecorationLine: "underline",
    fontSize: 12,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#ff5b5b',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    
  },
  buttonText: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'regular',
  },
  logo:{
    position:'absolute',
    marginBottom: -610,
    fontSize: 32,
    fontWeight:'regular',
    fontFamily: 'GreatVibes',
    padding: 37,
  },
  logoText:{
    position:'absolute',
    marginBottom: -710,
    flexDirection:'row',
    alignItems: 'center',
    justifyContent:'center',
    marginTop: -38,
    fontFamily:"Sansationlight"
  },
  line:{
    width:50,
    height:22,
    flex:1,
  },
  TextM:{
    letterSpacing: 7,
    fontSize: 20,
    fontWeight:'light',
  },
  signUpContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  signUpText: {
    fontSize: 15,
    alignSelf: 'left',

    color: '#ffffffff',
  }
});

