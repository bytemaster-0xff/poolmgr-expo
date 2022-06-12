
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import { StyleSheet, Text, PermissionsAndroid, View, TextInput, TouchableOpacity} from 'react-native';
import { NavigationContainer } from "@react-navigation/native";

export default function Auth({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');


    const login = (email: string, password: string) => {
        console.log('login called.');
        console.log(email, password);
        console.log(navigation);
        navigation.replace('scanPage');
    }

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label} >Email Address:</Text>

                <TextInput style={styles.inputStyle} placeholder="enter email" onChangeText={e => setEmail(e)}/>
                <Text style={styles.label}>Password:</Text>
                <TextInput style={styles.inputStyle} placeholder="enter pwd" onChangeText={e => setPassword(e)}/> 

                <StatusBar style="auto" />
                <TouchableOpacity style={styles.submitButton} onPress={() => login(email, password)}><Text style={styles.submitButtonText}> Submit </Text></TouchableOpacity>
            </View>
        </View>
    );
}

