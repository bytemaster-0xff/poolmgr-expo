
import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import styles from '../styles';
import { StyleSheet, Text, PermissionsAndroid,ActivityIndicator, View, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IReactPageServices } from "../services/react-page-services";

export const AuthPage = ({ props, navigation, route }: IReactPageServices) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isBusy, setIsBusy] = useState(false);

    const login = async (email: string, password: string) => {
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

        setIsBusy(true);

        fetch('https://api.nuviot.com/api/v1/auth',
            {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }).then(result => result.json())
            .then(async result => {
                setIsBusy(false);
                if(result.successful){
                    await AsyncStorage.setItem("isLoggedIn", "true");

                    await AsyncStorage.setItem("jwt", result.result.accessToken);
                    await AsyncStorage.setItem("refreshtoken", result.result.refreshToken);
                    await AsyncStorage.setItem("refreshtokenExpires", result.result.refreshTokenExpiresUTC);
                    await AsyncStorage.setItem("jwtExpires", result.result.accessTokenExpiresUTC);
                    navigation.replace('homePage')
                }
                else {
                    alert(result.errors[0].message);
                }
            })
            .catch((err) => {
                setIsBusy(false);
                console.log(err);
            })
            .finally(() => {
                
            });
    }

    return (
        <View style={styles.container}>
            {!isBusy && <View style={styles.formGroup}>
                <Text style={styles.label} >Email Address:</Text>

                <TextInput style={styles.inputStyle} placeholder="enter email" onChangeText={e => setEmail(e)} />
                <Text style={styles.label}>Password:</Text>
                <TextInput style={styles.inputStyle} secureTextEntry={true} placeholder="enter pwd" onChangeText={e => setPassword(e)} />

                <StatusBar style="auto" />
                <TouchableOpacity style={styles.submitButton} onPress={() => login(email, password)}><Text style={styles.submitButtonText}> Submit </Text></TouchableOpacity>
            </View>}
            {isBusy &&
                <View style={styles.spinnerView}>                
                <Text style={{fontSize: 25}}>Please Wait</Text>    
                    <ActivityIndicator size="large" color="#00ff00" animating={isBusy} />
                </View>
    }
        </View>
    );
}

export default AuthPage

