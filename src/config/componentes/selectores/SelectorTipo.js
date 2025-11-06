import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// --- PALETA DE COLORES "NEÓN OSCURO" ---
const COLORES = {
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
};

// Definimos los tipos aquí para que sean consistentes
const tipos = ['Skincare', 'Cabello', 'Uñas', 'Maquillaje', 'Otros'];

export default function SelectorTipo({ tipoSeleccionado, onSelectTipo }) {
  return (
    <View style={styles.tipoContainer}>
      {tipos.map((t) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.tipoBtn,
            // Compara el tipo seleccionado con 't'
            tipoSeleccionado === t && styles.tipoActivo 
          ]}
          onPress={() => onSelectTipo(t)} // Llama a la función del componente padre
        >
          <Text 
            style={[
              styles.tipoText, 
              tipoSeleccionado === t && styles.tipoTextActivo
            ]}
          >
            {t}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- ESTILOS "NEÓN OSCURO" ---
const styles = StyleSheet.create({
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    // (Puedes ajustar 'justifyContent' si lo prefieres centrado)
    // justifyContent: 'center', 
  },
  tipoBtn: {
    backgroundColor: COLORES.superficie,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4, // Espacio entre botones
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  tipoActivo: {
    backgroundColor: COLORES.acentoPrincipal, // Tu color
    borderColor: COLORES.acentoPrincipal,
  },
  tipoText: {
    color: COLORES.textoPrincipal,
    fontSize: 14,
  },
  tipoTextActivo: {
    color: COLORES.textoPrincipal,
    fontWeight: 'bold',
  },
});