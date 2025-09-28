import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated } from "react-native";

export default function SplashScreen({ navigation }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de 3 segundos (ajustable)
    Animated.timing(progress, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: false,
    }).start(() => {
      navigation.replace("Login"); // cuando termina → Login
    });
  }, [navigation, progress]);

  // Interpolamos para que la barra crezca en ancho
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ImageBackground
      source={require('../assets/fondo.png')}
      style={styles.container}
    >
      <Text style={styles.title}>Mi App</Text>

      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progress, { width }]} />
      </View>

      {/* Botón para saltar */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Login")}
      >
        <Text style={styles.buttonText}>Saltar</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#555",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 20,
  },
  progress: {
    height: "100%",
    backgroundColor: "#ff5b5b", // rojo (puedes cambiar)
  },
  button: {
    marginTop: 30,
    backgroundColor: "#ff5b5b",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});



