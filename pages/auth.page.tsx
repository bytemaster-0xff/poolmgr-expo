
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import { StyleSheet, Text, PermissionsAndroid, View, TextInput, TouchableOpacity } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Auth({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = async (email: string, password: string) => {
        console.log('login called.');
        console.log(email, password);
    
        let request = {
            GrantType: 'password',
            AppInstanceId: 'ABC123',
            AppId: 'ABC1234',
            DeviceId: 'ABC123',
            ClientType: 'mobileapp',
            Email: email,
            Password: password,
            UserName: email
        }

            fetch('https://api.nuviot.com/api/v1/auth',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }).then(result => result.json())
              .then(async result=> {
               await AsyncStorage.setItem("isLoggedIn","true");
          
               await AsyncStorage.setItem("jwt",result.result.accessToken);
               await AsyncStorage.setItem("refreshtoken",result.result.refreshToken);
               await AsyncStorage.setItem("refreshtokenExpires",result.result.refreshTokenExpiresUTC);
               await AsyncStorage.setItem("jwtExpires",result.result.accessTokenExpiresUTC);
                navigation.replace('homePage')

            })
            .catch((err) => {
                console.log(err);
            });
        }

        return (
            <View style={styles.container}>
                <View style={styles.formGroup}>
                    <Text style={styles.label} >Email Address:</Text>

                    <TextInput style={styles.inputStyle} placeholder="enter email" onChangeText={e => setEmail(e)} />
                    <Text style={styles.label}>Password:</Text>
                    <TextInput style={styles.inputStyle} placeholder="enter pwd" onChangeText={e => setPassword(e)} />

                    <StatusBar style="auto" />
                    <TouchableOpacity style={styles.submitButton} onPress={() => login(email, password)}><Text style={styles.submitButtonText}> Submit </Text></TouchableOpacity>
                </View>
            </View>
        );
    }

