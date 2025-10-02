//import React from 'react';
//import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
//import { signOut } from 'firebase/auth';
//import { auth } from '../src/config/firebaseConfig';


//export default function Home({ navigation }) {

//  const handleLogOut = async () => {
//    try {
//      await signOut(auth);  
//      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");
//      navigation.replace('Login');  
//    } catch (error) {
//      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
//    }
//  };

//  return (
//    <View style={styles.container}>

//      <Text style={styles.title}>Bienvenido a la aplicación</Text>
//      <TouchableOpacity style={styles.button} onPress={handleLogOut}>
//        <Text style={styles.buttonText}>Cerrar sesión</Text>
//      </TouchableOpacity>
//    </View>
//  );
//}

//const styles = StyleSheet.create({
//  container: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//    padding: 20,
//    backgroundColor: '#fff',
//  },
//  logo: {
//    width: 100,
//    height: 100,
//    marginBottom: 20,
//  },
//  title: {
//    fontSize: 24,
//    fontWeight: 'bold',
//    marginBottom: 20,
//  },
//  button: {
//    backgroundColor: '#922b21',
//    paddingVertical: 10,
//    paddingHorizontal: 40,
//    borderRadius: 5,
//    marginTop: 20,
//  },
//  buttonText: {
//    color: '#fff',
//    fontSize: 16,
//    fontWeight: 'bold',
//  },
//});

// /screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Requiere instalación previa

const quickAccessItems = [
  { title: 'Productos', desc: 'Gestiona todos los productos disponibles.' },
  { title: 'Agenda', desc: 'Organiza y revisa tus turnos fácilmente.' },
  { title: 'Usuarios', desc: 'Gestiona tus clientes y su información.' },
  { title: 'Servicios', desc: 'Registra y consulta todas tus ventas.' },
  { title: 'Proveedores', desc: 'Gestiona tus proveedores y su información.' },
  { title: 'Compras', desc: 'Gestiona todas tus compras.' },
];

const Home = () => {
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        <Icon name="add-circle" size={18} color="red" />
        <Icon name="bag-handle" size={18} color="#4DB6AC" style={{ marginLeft: 8 }} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDesc}>{item.desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>¡Bienvenida,</Text>
        <Text style={styles.name}>Romina</Text>
      </View>

      <Text style={styles.sectionTitle}>Accesos rápidos</Text>

      <FlatList
        data={quickAccessItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Icon name="home" size={24} color="white" />
          <Text style={styles.navText}>Inicio</Text>
        </View>
        <View style={styles.navItem}>
          <Icon name="person" size={24} color="#888" />
          <Text style={[styles.navText, { color: '#888' }]}>Perfil</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

//css
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  welcome: {
    color: '#ccc',
    fontSize: 18,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  iconRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardDesc: {
    fontSize: 12,
    color: '#ccc',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: 'white',
  },
});

