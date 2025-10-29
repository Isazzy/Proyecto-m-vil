import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Alert 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function AgregarProducto({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [tipo, setTipo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [imagen, setImagen] = useState(null);

  const seleccionarImagen = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permiso requerido', 'Debes permitir acceso a la galería.');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagen(result.assets[0].uri);
    }
  };

  const handleGuardar = async () => {
    if (!nombre.trim() || !precio.trim() || !tipo.trim() || !cantidad.trim()) {
      return Alert.alert('Error', 'Por favor completa todos los campos.');
    }

    try {
      await addDoc(collection(db, 'productos'), {
        nombre,
        precio: parseFloat(precio),
        tipo,
        cantidad: parseInt(cantidad),
        imagen, // guardamos el URI local
      });

      Alert.alert('Éxito', 'Producto guardado correctamente.');
      navigation.goBack();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      Alert.alert('Error', 'No se pudo guardar el producto.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Agregar Producto</Text>

      <TouchableOpacity style={styles.imageContainer} onPress={seleccionarImagen}>
        {imagen ? (
          <Image source={{ uri: imagen }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={50} color="#888" />
            <Text style={{ color: '#888' }}>Seleccionar imagen</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#aaa"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={precio}
        onChangeText={setPrecio}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipo}
          onValueChange={setTipo}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Seleccionar tipo" value="" color="#aaa" />
          <Picker.Item label="Skincare" value="skincare" />
          <Picker.Item label="Cabello" value="cabello" />
          <Picker.Item label="Uñas" value="uñas" />
          <Picker.Item label="Maquillaje" value="maquillaje" />
          <Picker.Item label="Otros" value="otros" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        placeholderTextColor="#aaa"
        keyboardType="numeric"
        value={cantidad}
        onChangeText={setCantidad}
      />

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.btnGuardar} onPress={handleGuardar}>
          <Text style={styles.btnText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnCancelar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.btnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 160,
    height: 160,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#97c5df',
  },
  imagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    color: '#fff',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  btnGuardar: {
    backgroundColor: '#97c5df',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  btnCancelar: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
