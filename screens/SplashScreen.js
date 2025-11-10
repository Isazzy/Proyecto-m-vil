import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, //Obtiene el ancho y alto de la pantalla, para estilos responsivos
  StatusBar,//Controla el estilo de la barra de estado del teléfoo 
  ImageBackground
} from 'react-native';
// --- CAMBIO: Importamos 'FadeIn' para el texto 'MI TIEMPO' ---
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

const { width, height } = Dimensions.get("window");
const COLORES = {
  fondo: '#000000',
  superficie: '#190101', 
  textoPrincipal: '#FEE6E6', 
  textoSecundario: '#A0A0A0', 
};

export default function SplashScreen({ navigation }) {
  useEffect(() => {//Hokk, se ejecuta una vez
    const timer = setTimeout(() => {
      navigation.replace("Login"); //replace reemplaza la pantalla actual
    }, 4000); 
    return () => clearTimeout(timer); //funcion de limpieza, si se cierra la app, cancela el temporizador
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../assets/Splash.png')} 
      style={styles.container}
      resizeMode="cover"//Asegura que llene la pantalla sin distorsionarse
    >
      <View style={styles.contentOverlay}> 
        <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
        <View style={styles.contentContainer}>
          <View style={styles.contentContainer1}>
            <Animated.Text
              entering={FadeInUp.delay(500).duration(1200)}
              style={styles.logo}
            >
              Romina
            </Animated.Text>
            <Animated.Text
              entering={FadeInUp.delay(700).duration(1200)}
              style={styles.logo1}
            >
              Magallanez
            </Animated.Text>
          </View >
          <Animated.View 
            entering={FadeIn.delay(1300).duration(1500)} 
            style={styles.logoText}
          >
            <View style={styles.line} />
            <Text style={styles.TextM}> M  I    T  I  E  M  P  O  </Text>
            <View style={styles.line} />
          </Animated.View>
        </View>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: { 
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentOverlay: { 
    flex: 1,
    backgroundColor: 'transparent', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.06,
  },
  contentContainer: {
    alignItems: 'center',
  },
  contentContainer1:{
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row", 
    justifyContent: "center", 
  },
  logo:{
    color: COLORES.textoPrincipal, 
    marginRight: 12,
    fontSize: width * 0.12, 
    fontFamily: 'GreatVibes', 
    textAlign:"center",
  },
  logo1:{
    color: COLORES.textoPrincipal, 
    fontSize: width * 0.12, 
    fontFamily: 'GreatVibes', 
  },
  logoText:{
    marginBottom: height * 0.09,
    flexDirection:"row",
    justifyContent:"center", 
    alignItems: 'center',
    marginTop: height * -0.01,
  },
  line:{
    width:"35%",
    backgroundColor: COLORES.textoSecundario, 
    height: 1,
  },
  TextM:{
    fontSize: width * 0.03,
    color: COLORES.textoSecundario, 
    marginHorizontal: 8,
  },  
});