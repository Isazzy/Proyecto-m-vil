import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Image, Alert, Platform, ScrollView
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import { auth, firestore } from '../src/config/firebaseConfig';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

export default function EditarPerfil({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState(null);
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!auth.currentUser) return;
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setNombre(data.nombre || '');
        setApellido(data.apellido || '');
        setTelefono(data.telefono || '');
        setEdad(data.edad ? data.edad.toString() : '');
        setSexo(data.sexo || null);
        setFechaNacimiento(data.fechaNacimiento?.toDate ? data.fechaNacimiento.toDate() : new Date());
        setLocalImage(auth.currentUser.photoURL || null);
      }
    };
    cargarDatos();
  }, []);

  const formatFecha = (date) =>{
    return date.toLocaleDateString('es-ES');
  };

  const cambiarFoto = async () => {
    Alert.alert('Foto de perfil', 'Selecciona una opción', [
      {
        text: 'Sacar foto',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect:[1,1], quality:0.7 });
          if (!result.canceled) setLocalImage(result.assets[0].uri);
        }
      },
      {
        text: 'Elegir de galería',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing:true, aspect:[1,1], quality:0.7 });
          if (!result.canceled) setLocalImage(result.assets[0].uri);
        }
      },
      { text: 'Cancelar', style:'cancel' }
    ]);
  };

  const guardarPerfil = async () => {
    if (!nombre.trim() || !apellido.trim() || !sexo) {
      Alert.alert('Error', 'Completa todos los campos obligatorios.');
      return;
    }
    if (!auth.currentUser) {
      Alert.alert('Error', 'Usuario no autenticado.');
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        nombre,
        apellido,
        telefono,
        edad: Number(edad) || null,
        sexo,
        fechaNacimiento,
        photoURL: localImage || auth.currentUser.photoURL
      }, { merge: true });

      await updateProfile(auth.currentUser, {
        displayName: `${nombre} ${apellido}`,
        photoURL: localImage || auth.currentUser.photoURL
      });

      Alert.alert('Éxito', 'Perfil actualizado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.log('Error al guardar perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow:1, padding:20, backgroundColor:'#131111ff' }}>
      <Text style={styles.title}>Editar Perfil</Text>

      <View style={styles.imageContainer}>
        <Image source={{ uri: localImage || 'https://via.placeholder.com/150' }} style={styles.profileImage} />
        <TouchableOpacity style={styles.cameraIcon} onPress={cambiarFoto}>
          <FontAwesome name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
      <TextInput style={styles.input} placeholder="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Edad" value={edad} onChangeText={setEdad} keyboardType="numeric" />

      <TouchableOpacity style={styles.dateButton} onPress={() => setDatePickerVisibility(true)}>
        <Text style={styles.dateButtonText}>Fecha de nacimiento: {formatFecha(fechaNacimiento)}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        maximumDate={new Date()}
        date={fechaNacimiento}
        onConfirm={(date) => { setFechaNacimiento(date); setDatePickerVisibility(false); }}
        onCancel={() => setDatePickerVisibility(false)}
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
      />

      <View style={styles.pickerContainer}>
        <Picker selectedValue={sexo} onValueChange={setSexo} style={styles.picker}>
          <Picker.Item label="Seleccionar " value={null} color="#aaa" />
          <Picker.Item label="Masculino" value="masculino" />
          <Picker.Item label="Femenino" value="femenino" />
        </Picker>
      </View>

      <View style={styles.containerBottom}>
        <TouchableOpacity style={styles.button} onPress={guardarPerfil}>
          <Text style={styles.buttonText}>Guardar </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button1} onPress={()=> navigation.navigate("Perfil")}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { 
    fontSize:24, 
    fontWeight:'bold', 
    color:'#fff', 
    marginBottom:20, 
    textAlign:'center' 
  },
  imageContainer: { 
    alignItems:'center', 
    marginBottom:20 
  },
  profileImage: { 
    width:140, 
    height:140, 
    borderRadius:70, 
    borderWidth:2, 
    borderColor:'#ff5b5b' 
  },
  cameraIcon: { 
    position:'absolute',
    bottom:10, 
    right:105, 
    backgroundColor:'#ff5b5b', 
    padding:8, 
    borderRadius:20 
  },
  input: { 
    backgroundColor:'#242121', 
    color:'#fff', 
    borderRadius:8, 
    padding:12, 
    marginBottom:12 
  },
  dateButton: { 
    backgroundColor:'#242121', 
    borderRadius:8, 
    padding:12, 
    marginBottom:12 
  },
  dateButtonText: { 
    color:'#fff' 
  },
  pickerContainer: { 
    backgroundColor:'#242121', 
    borderRadius:8, 
    marginBottom:12 
  },
  picker: { 
    color:'#fff' 
  },
  containerBottom: {
    flexDirection: "row", justifyContent: "space-between", 
  },
  button: { 
    backgroundColor:'#ff5b5b', 
    padding:12,
    paddingVertical: 10, 
    borderRadius:10, 
    alignItems:'center', 
    width: 155,
  },
  buttonText: { 
    color:'#fff', 
    fontSize:16, 
    fontWeight:'bold' 
  },
  button1:{
    backgroundColor: "#413939ff",
    borderRadius: 10,
    alignItems: "center",
    padding: 12,
    width: 155,
  },
});
