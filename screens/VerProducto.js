import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  SafeAreaView, // --- NUEVO ---
  StatusBar,    // --- NUEVO ---
  Dimensions    // --- NUEVO ---
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Para el placeholder

// (Se eliminaron 'db' y 'storage' ya que no se usan en esta pantalla)

// --- PALETA DE COLORES "NEÓN OSCURO" ---
const COLORES = {
  fondo: '#000000',
  superficie: '#190101', 
  textoPrincipal: '#FEE6E6', 
  textoSecundario: '#A0A0A0', 
  acentoPrincipal: '#FB5B5B', 
  acentoAzul: '#5B5BFB',
};

const { width } = Dimensions.get('window'); // Para hacer la imagen cuadrada

export default function VerProducto({ route }) {
  const { item } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView style={styles.container}>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            {/* --- CAMBIO: Icono en placeholder --- */}
            <Ionicons name="image-outline" size={60} color={COLORES.textoSecundario} />
            <Text style={{ color: COLORES.textoSecundario, marginTop: 8 }}>Sin imagen</Text>
          </View>
        )}

        {/* --- CAMBIO: Contenedor para el padding --- */}
        <View style={styles.infoContainer}>
          {/* --- CAMBIO: Jerarquía de texto --- */}
          <Text style={styles.tipo}>{item.tipo || 'Sin Categoría'}</Text>
          <Text style={styles.nombre}>{item.nombre}</Text>

          {/* --- CAMBIO: Estilo de InfoBox --- */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Precio:</Text>
            {/* --- CAMBIO: Estilo del precio --- */}
            <Text style={[styles.value, styles.precioValue]}>${item.precio}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Stock (Cantidad):</Text>
            <Text style={styles.value}>{item.cantidad}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS "NEÓN OSCURO" ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORES.fondo,
  },
  image: {
    width: width, // Ocupa todo el ancho
    height: width, // Alto igual al ancho (cuadrado)
    resizeMode: 'cover',
  },
  noImage: {
    width: width,
    height: width,
    backgroundColor: COLORES.superficie, // Color de fondo de tarjeta
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 16, // Padding para el texto
    marginTop: 8,
  },
  nombre: { 
    color: COLORES.textoPrincipal, 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, // Más espacio después del título
  },
  tipo: { 
    color: COLORES.acentoAzul, // Acento de color
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase', // Estilo
  },
  infoBox: {
    backgroundColor: COLORES.superficie, // Color de tarjeta
    padding: 16,
    borderRadius: 16, // Borde consistente
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { 
    color: COLORES.textoSecundario, 
    fontSize: 16,
  },
  value: { 
    color: COLORES.textoPrincipal, 
    fontSize: 18, 
    fontWeight: '600',
  },
  precioValue: {
    color: COLORES.acentoPrincipal, // Tu color principal
    fontWeight: 'bold',
  },
});