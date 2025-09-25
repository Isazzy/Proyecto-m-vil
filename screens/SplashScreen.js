import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";

export default function SplashScreen({ navigation }) {

  return (
    <View style={styles.container}>
      {/* Imagen superior */}
      <Image
        source={require("../assets/logo.png")} 
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Texto central */}
      <View style={styles.textContainer}>
        <Text style={styles.mainText}>
          Cuidamos tu{"\n"}imagen,{"\n"}realzamos tu{"\n"}belleza.
        </Text>
      </View>

      {/* Botón */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  headerImage: {
    width: "100%",
    height: 220,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
  },
  mainText: {
    fontFamily: "SansationRegular",
    fontSize: 24,
    color: "#2C3E50",
    lineHeight: 36,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonText: {
    fontFamily: "SansationRegular",
    fontSize: 18,
    color: "#fff",
  },
});
