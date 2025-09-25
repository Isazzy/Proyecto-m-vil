import React, {useState} from 'react'
import { StyleSheet } from 'react-native'
import { View, Button, TextInput, ScrollView} from 'react-native'
import firebase from '../src/config/firebaseConfig'

const CreateClientScreen=() =>{

    const [state, setstate] = useState({
        nombre: "",
        email:"",
        telefono: ""
    });

    const handleChangeText = (nombre, value) => {
        setstate({ ...state, [nombre]:value})
    }

    const SaveNewClient = () =>{
        if (state.name === ''){
            alert('Ingrese un nombre')
        }else {
            firebase.db.collection('clientes').add({
                nombre: state.name,
                email: state.email,
                telefono: state.telefono
            })
            alert('guardado')
        }
    }

    return(
        <ScrollView style={styles.container}>
            <View style={styles.inputGroup}>
                <TextInput placeholder='Nombre' 
                onChangeText={(value) => handleChangeText('nombre', value) }
                    />
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder='Email' 
                onChangeText={(value) => handleChangeText('email', value) }
                />
            </View>
            <View style={styles.inputGroup}>
                <TextInput placeholder='Telefono' 
                onChangeText={(value) => handleChangeText('telefono', value) }
                />
            </View>
            <View>
                <Button title='Guardar' onPress={() => SaveNewClient()} />
            </View>
        </ScrollView>
    )
}
const styles = StyleSheet.create({
    container: {
            flex: 1,
            padding: 35
    },
    inputGroup:{
        flex: 1,
        padding:0,
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#8f2222ff"
    }
})
export default CreateClientScreen;