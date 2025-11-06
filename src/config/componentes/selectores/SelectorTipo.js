import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const COLORES = {
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
};
const tipos = ['Skincare', 'Cabello', 'Uñas', 'Maquillaje', 'Otros'];

export default function SelectorTipo({ tipoSeleccionado, onSelectTipo }) {
  return (
    <View style={styles.tipoContainer}>
      {tipos.map((t) => (
        <TouchableOpacity
          key={t}
          style={[
            styles.tipoBtn,
            tipoSeleccionado === t && styles.tipoActivo 
          ]}
          onPress={() => onSelectTipo(t)} 
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
const styles = StyleSheet.create({
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tipoBtn: {
    backgroundColor: COLORES.superficie,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4, 
    borderWidth: 1,
    borderColor: COLORES.superficie,
  },
  tipoActivo: {
    backgroundColor: COLORES.acentoPrincipal, 
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