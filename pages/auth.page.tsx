
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, PermissionsAndroid, View, TextInput, TouchableOpacity} from 'react-native';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const login = (email: string, password: string) => {
        console.log('login called.');
        console.log(email, password);
    }

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label} >Email Address:</Text>

                <TextInput style={styles.inputStyle} placeholder="enter email" onChangeText={e => setEmail(e)}></TextInput>
                <Text style={styles.label}>Password:</Text>
                <TextInput style={styles.inputStyle} placeholder="enter pwd" onChangeText={e => setPassword(e)}> </TextInput>

                <StatusBar style="auto" />
                <TouchableOpacity style={styles.submitButton} onPress={() => login(email, password)}><Text style={styles.submitButtonText}> Submit </Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'blue',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    listRow: {
        flexDirection: 'row'
    },
    formGroup: {
        margin: 20
    },
    inputStyle: {
        backgroundColor: 'white',
        width: 300
    },
    label: {
        color: 'white'
    },
    submitButton: {
        backgroundColor: "green",
        padding: 11,
        margin: 16,
        height: 42,
        width: 120,
        alignItems: 'center'
    },
    submitButtonText: {
        color: "white"
    }
});
