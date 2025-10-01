import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity,Dimensions } from "react-native";

  const {width, height}= Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  
  return (
    <View style={styles.container}>
            <View style={styles.imageContainer}>
      
              <ImageBackground source={require('../assets/fondo.png')} style={styles.fondo} />
      
            </View>  
            
           <View>
              <Text style={styles.logo}>Romina Magallanez</Text>
                <View style={styles.logoText}>
                  <View style={styles.line}/>
                    <View >
                      <Text style={styles.TextM}> E  S  T  I  L  I  S  T  A </Text>
                    </View> 
                  <View style={styles.line}  />
                   
                </View>
                <Text style={styles.Text1}>Cuidamos tu imagen, {"\n"}realzamos tu belleza. </Text>
               
            </View>
        {/* Botón para saltar */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={styles.buttonText}> Comenzar </Text>
        </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.04,
    backgroundColor: "#d6cbcbff",
  },
  //cambiar el boton de comenzar, un poco mas chico, cambiar el mensaje a "Por favor complete ambos campos"
  //Subir un poco más el enlace de la lista de registros, "No tenes una cuenta aún, Registrate"
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
    color: "#fff",
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
    color: "#2c3e50",          
    textAlign: "auto",      
    alignSelf: "flex-start",
    marginTop: height * 0.07,  // separación desde arriba
    marginHorizontal: width * 0.08, // padding lateral 
    fontWeight: "bold",
  },
    button: {
    backgroundColor: '#fa4c4cff',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.1, 
    borderRadius: 10,
    alignItems: 'center',
    marginTop: height * 0.06,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.06,
  },
});


