import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, FadeInLeft, FadeInUp } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");


export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Animated.Image
          entering={FadeInUp.delay(400).duration(2000).springify()}
          source={require("../assets/fondo.png")}
          style={styles.fondo}
        />
      </View>

      <View>
       
        <Animated.Text
          entering={FadeInUp.delay(600).duration(1000).springify()}
          style={styles.logo}
        >
          Romina Magallanez
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(800).duration(2200).springify()} style={styles.logoText}>
          <View style={styles.line} />
          <View>
            <Text style={styles.TextM}> E  S  T  I  L  I  S  T  A </Text>
          </View>
          <View style={styles.line} />
        </Animated.View>

        <Animated.Text
          entering={FadeInLeft.delay(800).duration(1000).springify()}
          style={styles.Text1}
        >
          Cuidamos tu imagen, {"\n"}realzamos tu belleza.
        </Animated.Text>
      </View>

      {/* Botones */}
      <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.buttonText}> Iniciar sesión </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
        <TouchableOpacity
          style={styles.button2}
          onPress={() => navigation.replace("SignUp")}
        >
          <Text style={styles.buttonText}> Crear cuenta </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: "# f2foeb",
  },
  //cambiar el boton de comenzar, un poco mas chico, cambiar el mensaje a "Por favor complete ambos campos"
  //Subir un poco más el enlace de la lista de registros, "No tenes una cuenta aún, Registrate" f2foeb- f1f1f1- f4f1f8-f5f5f5
  imageContainer: {
    position: "absolute",
    top: 0,
    borderBottomLeftRadius: 44,
    borderBottomRightRadius: 44,
    overflow: "hidden",
  
  },
  fondo: {
    width: width * 1.0,
    height: height * 0.4, // altura de la imagen
 
  },

  logo:{
    color: "#f2f0eb",
    fontSize: width * 0.11, 
    fontFamily: 'GreatVibes',
    marginTop:height * 0.12,
    textAlign:"center",
  },
  logoText:{
    
    marginBottom: height * 0.10,
    flexDirection:"row",
    justifyContent:"center", 
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
  Text1:{
    fontSize: width * 0.12, 
     lineHeight: width * 0.16,  // mejor interlineado
    color: "#0b1a29ff",          
    textAlign: "auto",      
    alignSelf: "flex-start",
    marginTop: height * 0.07,  // separación desde arriba
    marginHorizontal: width * 0.08, // padding lateral 
    fontWeight: "bold",
  },
    button: {
    backgroundColor: '#fa4c4cff',
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.1, 
    borderRadius: 10,
    alignItems: 'center',
    marginTop: height * 0.04,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.06,
  },
  button2:{
    backgroundColor: "#060608ff",
    paddingVertical: height * 0.007,
    paddingHorizontal: width * 0.1,
    borderRadius: 10,
    alignItems: "center",
    marginTop: height * 0.01,

  }
});


