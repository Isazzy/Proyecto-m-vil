import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  StatusBar,   
  Dimensions    
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

const COLORES = {
  fondo: '#000000',
  superficie: '#190101', 
  textoPrincipal: '#FEE6E6', 
  textoSecundario: '#A0A0A0', 
  acentoPrincipal: '#FB5B5B', 
  acentoAzul: '#5B5BFB',
};

const { width } = Dimensions.get('window'); 

export default function VerProducto({ route }) {
  const { item } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORES.fondo} />
      <ScrollView style={styles.container}>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={60} color={COLORES.textoSecundario} />
            <Text style={{ color: COLORES.textoSecundario, marginTop: 8 }}>Sin imagen</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.tipo}>{item.tipo || 'Sin Categoría'}</Text>
          <Text style={styles.nombre}>{item.nombre}</Text>

          {/* Marca */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Marca:</Text>
            <Text style={styles.value}>{item.marca || 'Sin especificar'}</Text>
          </View>

          {/* Precio */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Precio:</Text>
            <Text style={[styles.value, styles.precioValue]}>${item.precio}</Text>
          </View>

          {/* Stock actual */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Stock actual:</Text>
            <Text style={styles.value}>{item.cantidad}</Text>
          </View>

          {/* Stock mínimo */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Stock mínimo:</Text>
            <Text style={styles.value}>{item.stockMinimo ?? 'No definido'}</Text>
          </View>

          {/* Estado Activo / Inactivo */}
          <View style={styles.infoBox}>
            <Text style={styles.label}>Estado:</Text>
            <Text 
              style={[
                styles.value, 
                item.activo 
                  ? styles.estadoActivo 
                  : styles.estadoInactivo
              ]}
            >
              {item.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORES.fondo,
  },
  image: {
    width: width, 
    height: width, 
    resizeMode: 'cover',
  },
  noImage: {
    width: width,
    height: width,
    backgroundColor: COLORES.superficie, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: 16, 
    marginTop: 8,
  },
  nombre: { 
    color: COLORES.textoPrincipal, 
    fontSize: 26, 
    fontWeight: 'bold', 
    marginBottom: 20, 
  },
  tipo: { 
    color: COLORES.acentoAzul, 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase', 
  },
  infoBox: {
    backgroundColor: COLORES.superficie, 
    padding: 16,
    borderRadius: 16, 
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
    color: COLORES.acentoPrincipal, 
    fontWeight: 'bold',
  },
  estadoActivo: {
    color: '#4CAF50', // Verde
  },
  estadoInactivo: {
    color: '#F44336', // Rojo
  },
});
