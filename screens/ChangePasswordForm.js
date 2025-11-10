import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signOut,
} from 'firebase/auth';
const { width } = Dimensions.get('window');
const COLORES = {
  superficie: '#190101',
  textoPrincipal: '#FEE6E6',
  textoSecundario: '#A0A0A0',
  acentoPrincipal: '#FB5B5B',
  acentoAzul: '#6ba1c1ff',
};

export default function ChangePasswordForm({ setShowModal }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

 
  const validarContrasena = (password) => {
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Error', 'Completá todos los campos.');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Las contraseñas no coinciden.');
    }

    if (!validarContrasena(newPassword)) return;

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert('Error', 'No hay un usuario activo.');
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña fue cambiada exitosamente. Por favor, volvé a iniciar sesión.',
        [{ text: 'OK', onPress: () => setShowModal(false) }]
      );
    } catch (error) {
      console.log('Error cambiando contraseña:', error);
      switch (error.code) {
        case 'auth/wrong-password':
          Alert.alert('Error', 'Tu contraseña actual es incorrecta.');
          break;
        case 'auth/weak-password':
          Alert.alert('Error', 'La nueva contraseña es demasiado débil.');
          break;
        case 'auth/too-many-requests':
          Alert.alert('Error', 'Demasiados intentos fallidos. Intentá más tarde.');
          break;
        default:
          Alert.alert('Error', 'Ocurrió un problema al cambiar la contraseña.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Contraseña</Text>

      
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color={COLORES.acentoPrincipal} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña actual"
          placeholderTextColor={COLORES.textoSecundario}
          secureTextEntry={!showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
          <FontAwesome name={showCurrent ? 'eye-slash' : 'eye'} size={18} color={COLORES.textoSecundario} />
        </TouchableOpacity>
      </View>

    
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color={COLORES.acentoPrincipal} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor={COLORES.textoSecundario}
          secureTextEntry={!showNew}
          value={newPassword}
          onChangeText={setNewPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)}>
          <FontAwesome name={showNew ? 'eye-slash' : 'eye'} size={18} color={COLORES.textoSecundario} />
        </TouchableOpacity>
      </View>

    
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color={COLORES.acentoPrincipal} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nueva contraseña"
          placeholderTextColor={COLORES.textoSecundario}
          secureTextEntry={!showConfirm}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          <FontAwesome name={showConfirm ? 'eye-slash' : 'eye'} size={18} color={COLORES.textoSecundario} />
        </TouchableOpacity>
      </View>

    
      <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={COLORES.textoPrincipal} />
        ) : (
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
        )}
      </TouchableOpacity>

     
      <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    color: COLORES.textoPrincipal,
    fontSize: width * 0.06,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORES.acentoPrincipal,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
    color: COLORES.acentoPrincipal,
  },
  input: {
    flex: 1,
    color: COLORES.textoPrincipal,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: COLORES.acentoAzul,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORES.textoPrincipal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORES.textoSecundario,
    fontSize: 14,
  },
});
