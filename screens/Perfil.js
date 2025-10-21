import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView } from 'react-native';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../src/config/firebaseConfig';

export default function Perfil() {
  const [user] = useAuthState(auth);

  const nombre = user?.displayName?.split(' ')[0] ?? 'Nombre';
  const apellido = user?.displayName?.split(' ')[1] ?? 'Apellido';
  const correo = user?.email ?? 'correo@ejemplo.com';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.perfilContainer}>
        <Image
          source={{ uri: user?.photoURL || 'https://via.placeholder.com/100?text=👤' }}
          style={styles.imagen}
        />
        <Text style={styles.nombre}>{nombre}</Text>
        <Text style={styles.apellido}>{apellido}</Text>
        <Text style={styles.correo}>{correo}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  perfilContainer: { alignItems: 'center', marginTop: 40 },
  imagen: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  nombre: { fontSize: 24, fontWeight: '700', color: '#fff' },
  apellido: { fontSize: 20, color: '#ccc' },
  correo: { fontSize: 16, color: '#999', marginTop: 10 },
});
