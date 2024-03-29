
import React, {  useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IReactPageServices } from "../services/react-page-services";


export default function SplashPage({ navigation } : IReactPageServices ) {

    const login = async () => {
        navigation.replace('authPage');
    }

    const checkStartup = async () => {
        console.log('startup');
        if((await AsyncStorage.getItem("isLoggedIn")) == "true"){
            navigation.replace('homePage')
        }

    }

    useEffect(() =>{
        checkStartup();
    });

    return (
        <View style={styles.container}>
            <View style={styles.formGroup}>                
                <StatusBar style="auto" />
                <Image source={require('../assets/nuviot-blue.png')} style={{width:300,height:80}} />
                <TouchableOpacity style={styles.submitButton} onPress={() => login()}><Text style={styles.submitButtonText}> Login </Text></TouchableOpacity>
            </View>
        </View>
    );
}

