import React, { useState } from 'react';
import {
    ImageBackground,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';

import { FontAwesome } from '@expo/vector-icons';
import { auth } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const { width, height } = Dimensions.get("window");
const backgroundImage = require("../assets/fondocortina.png");


export default function SignUp({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    const passwordRules = [
        { label: 'Al menos 8 caracteres', test: (pw) => pw.length >= 8 },
        { label: 'Una letra mayúscula', test: (pw) => /[A-Z]/.test(pw) },
        { label: 'Una letra minúscula', test: (pw) => /[a-z]/.test(pw) },
        { label: 'Un número', test: (pw) => /[0-9]/.test(pw) },
    ];

    //  NUEVA FUNCIÓN: Verifica si la contraseña cumple con TODAS las reglas
    const passesAllRules = (pw) => {
        return passwordRules.every(rule => rule.test(pw));
    };


    const handleSignUp = async () => {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Todos los campos son obligatorios.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Las contraseñas no coinciden.");
            return;
        }

        // Regex corregida y consistente con las reglas visibles: mínimo 8 caracteres
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        
        if (!passwordRegex.test(password)) {
            Alert.alert(
                "Error",
                "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula y un número."
            );
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Alert.alert("Registro exitoso", "Usuario registrado con éxito.");
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); 
        } catch (error) {
            let errorMessage = "Hubo un problema al registrar el usuario.";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "El correo electrónico ya está en uso.";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "El formato del correo electrónico no es válido.";
                    break;
                case 'auth/weak-password':
                    errorMessage = "La contraseña es demasiado débil.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Error de conexión, por favor intenta más tarde.";
                    break;
            }
            Alert.alert("Error", errorMessage);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
            <ImageBackground source={backgroundImage} resizeMode="cover" style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <View style={styles.container}>
                        <Text style={styles.title}>Regístrarse</Text>

                        <View style={styles.container2}>
                            {/* ... (Otros Inputs - Nombre, Apellido, Correo) ... */}

                            {/* Nombre Input */}
                            <Text style={styles.label}>Nombre</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su nombre"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>

                            {/* Apellido Input */}
                            <Text style={styles.label}>Apellido</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su apellido"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>

                            {/* Correo Input */}
                            <Text style={styles.label}>Correo</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="envelope" size={20} color="#ccc" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su correo"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                            
                            {/* Contraseña Input */}
                            <Text style={styles.label}>Contraseña</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ingrese su contraseña"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (!passwordTouched) setPasswordTouched(true);
                                    }}
                                    secureTextEntry={!showPassword}
                                />

                                {/*  CAMBIO CLAVE: Condición de Renderizado del Cartel */}
                                {/* Ahora se muestra SOLO si ha sido tocado Y NO cumple todas las reglas */}
                                {passwordTouched && !passesAllRules(password) && (
                                    <View style={styles.passwordRulesBox}>
                                        {passwordRules.map((rule, index) => {
                                            const passed = rule.test(password);
                                            return (
                                                <View key={index} style={styles.ruleItem}>
                                                    <FontAwesome
                                                        name={passed ? "check-circle" : "circle"}
                                                        size={16}
                                                        color={passed ? "#4CAF50" : "#ccc"}
                                                        style={{ marginRight: 8 }}
                                                    />
                                                    <Text style={[styles.ruleText, { color: passed ? "#4CAF50" : "#666" }]}>
                                                        {rule.label}
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                )}

                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <FontAwesome
                                        name={showPassword ? "eye-slash" : "eye"}
                                        size={20}
                                        color="#ccc"
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {/* Confirmar Contraseña Input */}
                            <Text style={styles.label}>Confirmar Contraseña</Text>
                            <View style={styles.inputContainer}>
                                <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirme su contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <FontAwesome
                                        name={showConfirmPassword ? "eye-slash" : "eye"}
                                        size={20}
                                        color="#ccc"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                                <Text style={styles.buttonText}>Crear Cuenta</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.signUpContainer}>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.signUpText}>¿Ya tienes cuenta?</Text>
                                <Text style={styles.signUpText2}>Inicia sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: width * 0.08,
        paddingVertical: height * 0.00,
    },
    fondo:{
        zIndex:0,
        width: width *1.0,
        height:height*1.0,
        position: "absolute"
    },
    container2: {
        borderRadius: 20,
        padding: width * 0.05,
        width: "100%",
        backgroundColor: "#504f4fff",
        opacity: 0.85,
    },
    title: { 
        color: "#fff",
        fontSize: width * 0.1,
        fontWeight: 'bold',
        marginTop: height * 0.01,
        marginBottom: height * 0.02,
    },
    label: {
        alignSelf: 'flex-start',
        fontSize: width * 0.04,
        fontWeight: 'bold',
        marginBottom: 5,
        color: "#000",
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: '#FF5B5B',
        marginBottom: height * 0.025,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: height * 0.05,
        color: "#000",
    },
    button: {
        backgroundColor: '#FF5B5B',
        paddingVertical: height * 0.015,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: height * 0.02,
    },
    buttonText: {
        color: '#fff',
        fontSize: width * 0.05,
        fontWeight: 'bold',
    },
    signUpText: {
        marginTop: height * 0.03,
        fontSize: width * 0.04,
        color: '#ffffffff',
        textAlign: 'center',
    },
    signUpText2: {
        color: '#FF5B5B',
        fontSize: width * 0.045,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    passwordRulesBox: {
        // Se cambió el marginBottom a 0 para que no agregue espacio cuando desaparece
        marginTop: 5,
        marginBottom: 15, // Mantener marginBottom aquí si quieres que ocupe espacio cuando está visible
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        width: '100%',
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    ruleText: {
        fontSize: 14,
    },
});