
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import { StyleSheet, Text, PermissionsAndroid, View, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function SplashPage({ navigation }) {

    const login = async () => {
        navigation.replace('authPage');
    }

    const checkStartup = async () => {

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
                <TouchableOpacity style={styles.submitButton} onPress={() => login()}><Text style={styles.submitButtonText}> Login </Text></TouchableOpacity>
            </View>
        </View>
    );
}

