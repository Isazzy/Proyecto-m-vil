import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Dimensions,ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';


const { width, height } = Dimensions.get("window");


export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [message, setMessage]=useState(null);
  const [typeMessage, setTypeMessage]=useState(null);

  useEffect(() => {
    if (typeMessage==="error" && email && password){
      setMessage(null);
    }
  }, [email,password]);

  const handleLogin = async () => {
    if (!email || !password) {
      setTypeMessage("error");
      setMessage("Por favor complete ambos campos.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Usuario logueado:", user);
      setMessage( "Has iniciado sesión correctamente."); 
         navigation.reset({ index: 0, routes: [{ name: 'Home' }] 
        });
     

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
      setMessage(errorMessage);
      setTypeMessage("error")
    }
  };


  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <View style={styles.imageContainer}>

        <ImageBackground source={require('../assets/fondo.png')} style={styles.fondo} />

      </View>
      
  
      
      <Text style={styles.title}>¡Bienvenido de nuevo!</Text>

      <View style={{ height: height * 0.01, justifyContent: "center", textAlign: "center", flexDirection: 'row',}}>
        {message && (
          <Text style={[styles.message, styles.errorMessage]}>
            {message}
          </Text>
        )}
      </View>

      <View style={styles.formBox}>
      <Text style={styles.label}></Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#f0f0f0ff"
        />
      </View>

      <Text style={styles.label}></Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          placeholderTextColor="#f0f0f0ff"
          value={password}
          onChangeText={(text) => setPassword (text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} marginRight={10} size={18} color="#e6e9dbff" />
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
        <View style={styles.line}/>
        <View >
          <Text style={styles.TextM}> M  I    T  I  E  M  P  O </Text>
        </View> 
        <View style={styles.line}  />
        
      </View>
      
      <View style={styles.signUpContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>¿No tenes cuenta aún?   
            <Text style={{color: "#ff5b5b"}}>  Regístrate</Text>
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
    paddingVertical: height*0.04,
    backgroundColor: '#181515ff',
  },

  imageContainer: {
    position: "absolute",
    top:0,
    borderBottomRightRadius: 100,
    overflow: "hidden",
    opacity: 0.4,
  },
  fondo:{

    width: width *1.1 ,
    height:height*0.3,//esta es la imagen
  },
  title: {
    fontFamily: 'GreatVibes',
    color: "#fff",
    fontSize: width * 0.1,
    fontWeight: 'bold',
    marginTop: height* 0.06,
    marginBottom: height *0.02,
  
  },
  label: {
    color: "#a3b941ff",
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  formBox:{
    
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
    color:"#fff",
    
  },
  optionsRow:{
    flexDirection:"row",
    justifyContent:'space-between',
    marginVertical: height * 0.015,
  },
  remember:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText:{
    color: "#fdfdfdff",
    marginLeft: 5,
    fontSize: width * 0.035,
  },
  forgot:{
    color: '#c7d9e4ff',
    fontSize: width * 0.030,
  },
  button: {
    backgroundColor: '#fa4c4cff',
    paddingVertical: height * 0.010,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: height * 0.03,

  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.06,
  },
  logo:{
    color: "#fff",
    fontSize: width * 0.10,
    fontFamily: 'GreatVibes',
    marginTop:height * 0.03,
  },
  logoText:{
    marginBottom: height * 0.04,
    flexDirection:'row',
    justifyContent:"space-between",
   

  },
  line:{
   
    width:"35%",
    backgroundColor: "#a5a3a3ff",
    marginHorizontal: 8,
    height: 1,
    marginTop: height * 0.010, 
    
  },
  
  TextM:{
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
  message:{
    marginTop: height * 0.01,
    fontSize: width * 0.04,
    textAlign: "center",
    position: "absolute",
  },
  errorMessage:{
    color:"#ff5b5b",
  },

 
});

